import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";
import merge from "lodash.merge";
import { resolve, success, fail, Throwable } from "ts-injection";

import { INVOKE_METHOD_NAME, META_REQUEST_MAPPING } from "../../constants";
import { useLogger } from "../../logger";
import {
  BigsbyConfig,
  BigsbyError,
  DeepPartial,
  InferredType,
  ParameterInstruction,
  ParameterInstructionTarget,
  RequestParseError,
  TypeCoercionError,
} from "../../types";
import {
  getConfig,
  isObject,
  tryParseNumber,
  tryParseObject,
} from "../../utils";

import {
  ContentType,
  HttpResponse,
  ParsedEventValue,
  RawEventValue,
  RestApiContext,
  RestApiHandler,
  RestApiHandlerConstructor,
  StandardizedEvent,
} from "./types";

const logger = useLogger();

export function createRestApiHandler(
  handlerClass: RestApiHandlerConstructor,
  handlerConfig?: DeepPartial<BigsbyConfig>
): Handler<APIGatewayProxyEvent, HttpResponse> {
  return async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<HttpResponse> => {
    const defaultConfig = getConfig();

    logger.debug(
      { defaultConfig, handlerConfig },
      "Merging defaultConfig <- handlerConfig."
    );
    const config = merge(defaultConfig, handlerConfig);

    if (config.logger.printRequest) {
      logger.info({ event, context }, "Received request.");
    }

    const response = await resolve(handlerClass)[INVOKE_METHOD_NAME](
      event,
      context,
      config
    );

    if (config.logger.printResponse) {
      logger.info({ response }, "Returning response.");
    }

    return response;
  };
}

export function callHook<
  HookType extends (...argArr: never[]) => ReturnType<HookType>
>(
  name: string,
  hook: HookType | undefined,
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): ReturnType<HookType> {
  logger.debug(`Calling lifecycle hook ${name}.`);

  return hook?.call(args) as ReturnType<HookType>;
}

export function enrichResponse(
  response: HttpResponse,
  { restApi: config }: BigsbyConfig
): HttpResponse {
  let enrichedResponse: HttpResponse = response;

  logger.info("Transforming handler response.");

  if (config.response.headers) {
    enrichedResponse = addResponseHeaders(response, config.response.headers);
  }

  if (config.response.enableInferContentType) {
    enrichedResponse = addInferredContentTypeBody(response);
  }

  return enrichedResponse;
}

function addResponseHeaders(
  response: HttpResponse,
  headersToAdd: { [headerName: string]: string }
): HttpResponse {
  logger.debug({ headers: headersToAdd }, "Adding default headers.");

  return {
    ...response,
    headers: Object.entries(headersToAdd).reduce(
      (
        newHeaders: NonNullable<HttpResponse["headers"]>,
        [headerName, headerValue]
      ) => ({
        ...newHeaders,
        [headerName]: newHeaders[headerName] ?? headerValue,
      }),
      response.headers ?? {}
    ),
  };
}

function addInferredContentTypeBody(response: HttpResponse): HttpResponse {
  logger.info("Inferring content type.");

  if (response.headers?.["content-type"]) {
    logger.debug("Content-Type header already provided in response, skipping.");
    return response;
  }

  const contentType = inferContentType(response.body);
  logger.debug({ contentType }, "Using Content-Type.");

  return {
    ...response,
    headers: addContentTypeToHeaders(contentType, response.headers ?? {}),
  };
}

function inferContentType(body: unknown): ContentType {
  switch (typeof body) {
    case "bigint":
    case "number":
    case "string":
      return ContentType.TEXT_PLAIN;
    case "boolean":
    case "object":
      return ContentType.APPLICATION_JSON;
    case "undefined":
      return ContentType.NONE;
    case "symbol":
    case "function":
    default:
      throw new BigsbyError(
        `Invalid body type ${typeof body}, cannot infer content type.`
      );
  }
}

function addContentTypeToHeaders(
  contentType: ContentType,
  headers: HttpResponse["headers"]
): HttpResponse["headers"] {
  const headerName = "Content-Type";

  switch (contentType) {
    case ContentType.APPLICATION_JSON:
      return { ...headers, [headerName]: "application/json" };
    case ContentType.TEXT_PLAIN:
      return { ...headers, [headerName]: "text/plain" };
    case ContentType.NONE:
    default:
      return headers;
  }
}

export function parseRequestParams(
  handler: RestApiHandler,
  context: RestApiContext
): Throwable<RequestParseError, ParsedEventValue[]> {
  logger.info("Mapping Lambda inputs to handler instructions.");

  const instructions: ParameterInstruction[] =
    Reflect.getOwnMetadata(
      META_REQUEST_MAPPING,
      handler.constructor,
      INVOKE_METHOD_NAME
    ) ?? [];
  const parameters: ParsedEventValue[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const instruction of sortInstructions(instructions)) {
    logger.debug({ instruction }, `Evaluating instruction.`);

    const evaluateResult = evaluateInstruction(instruction, context);

    if (evaluateResult.isError()) {
      return fail(evaluateResult.value());
    }

    parameters.push(evaluateResult.value());
  }

  return success(parameters);
}

function sortInstructions(
  instructions: ParameterInstruction[]
): ParameterInstruction[] {
  return instructions.sort((a, b) => a.paramIndex - b.paramIndex);
}

function evaluateInstruction(
  { type, searchKey, mapsTo, paramIndex }: ParameterInstruction,
  context: RestApiContext
): Throwable<RequestParseError, ParsedEventValue> {
  const {
    config: { restApi: config },
  } = context;

  if (mapsTo === ParameterInstructionTarget.CONTEXT) {
    return success(context);
  }

  const eventValue = extractEventValue(
    getEventValueContainer(context, mapsTo),
    mapsTo,
    searchKey
  );

  if (!eventValue) {
    logger.warn(
      `Field '${searchKey}' doesn't exist in event.${mapsTo}, parameter at index ${paramIndex} will be undefined.`
    );
    return success(undefined);
  }

  if (!config.request.enableTypeCoercion) {
    logger.debug("Type Coercion disabled, returning pristine event value.");
    return success(eventValue);
  }

  const parseResult = parseValueAsType(eventValue, type);

  if (parseResult.isError()) {
    logger.error(parseResult.value());

    return fail(
      new RequestParseError(
        `Failed to map event.${mapsTo} to parameter index ${paramIndex}.`
      )
    );
  }

  return success(parseResult.value());
}

function getEventValueContainer(
  context: RestApiContext,
  mapsTo: ParameterInstructionTarget
): Record<string, unknown> | RawEventValue {
  const {
    event: { pathParameters, queryStringParameters, headers, body },
  } = context;

  switch (mapsTo) {
    case ParameterInstructionTarget.CONTEXT:
      throw new BigsbyError(
        "Context targets should be returned before getting here, this is indicative of a code defect."
      );
    case ParameterInstructionTarget.BODY:
      return body;
    case ParameterInstructionTarget.PATH:
      return pathParameters;
    case ParameterInstructionTarget.QUERY:
      return queryStringParameters;
    case ParameterInstructionTarget.HEADER:
      return headers;
    default:
      throw new BigsbyError(`Unimplemented param target: ${mapsTo}`);
  }
}

function extractEventValue(
  container: Record<string, unknown> | RawEventValue,
  mapsTo: ParameterInstructionTarget,
  searchKey: string
): RawEventValue {
  let value: RawEventValue;

  if (mapsTo === ParameterInstructionTarget.BODY) {
    value = container;
  } else if (mapsTo === ParameterInstructionTarget.HEADER) {
    value = (container as Record<string, RawEventValue>)?.[
      searchKey.toLowerCase() as keyof Record<string, RawEventValue>
    ];
  } else {
    value = (container as Record<string, RawEventValue>)?.[
      searchKey as keyof Record<string, RawEventValue>
    ];
  }

  return value;
}

function parseValueAsType(
  value: RawEventValue,
  type: InferredType | undefined
): Throwable<TypeCoercionError, ParsedEventValue> {
  logger.debug({ type }, "Type Coercion enabled, returning value as type:");

  switch (type) {
    case InferredType.NUMBER:
      return tryParseNumber(value);
    case InferredType.BOOLEAN:
      return success(value === "true");
    case InferredType.ARRAY:
    case InferredType.OBJECT:
      return isObject(value) || Array.isArray(value)
        ? success(value)
        : tryParseObject(value);
    case InferredType.STRING:
    default:
      return success(value);
  }
}

export function standardizeEvent(
  event: APIGatewayProxyEvent
): StandardizedEvent {
  const standardEvent: StandardizedEvent = {
    ...event,
  } as StandardizedEvent;

  standardEvent.headers = Object.entries(event.headers).reduce(
    (headers, [headerName, headerValue]) => {
      delete headers[headerName]; // eslint-disable-line no-param-reassign
      return { ...headers, [headerName.toLowerCase()]: headerValue };
    },
    { ...standardEvent.headers }
  );

  if (event.headers["content-type"] === ContentType.APPLICATION_JSON) {
    standardEvent.body = tryParseObject(event.body)
      .onSuccess((value) => value)
      .onError(() => {
        throw new RequestParseError(
          "Content-Type is application/json but failed to parse event body."
        );
      })
      .output();
  }

  return standardEvent;
}
