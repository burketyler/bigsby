import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";
import merge from "lodash.merge";
import { resolve, success, Throwable } from "ts-injection";

import { INVOKE_METHOD_NAME, META_REQUEST_MAPPING } from "../../constants";
import { useLogger } from "../../logger";
import {
  BigsbyConfig,
  BigsbyError,
  DeepPartial,
  InferredType,
  ParameterInstruction,
  ParameterInstructionTarget,
  RequestInvalidError,
  TypeCoercionError,
} from "../../types";
import { getConfig, tryParseNumber, tryParseObject } from "../../utils";

import {
  ContentType,
  HttpResponse,
  ParsedEventValue,
  RawEventValue,
  RestApiContext,
  RestApiHandler,
  RestApiHandlerConstructor,
} from "./types";

const logger = useLogger();

export function createRestApiHandler(
  handlerClass: RestApiHandlerConstructor,
  config?: DeepPartial<BigsbyConfig>
): Handler<APIGatewayProxyEvent, HttpResponse> {
  return async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<HttpResponse> => {
    const defaultConfig = getConfig();

    logger.debug(
      { defaultConfig: getConfig(), handlerConfig: config },
      "Merging handlerConfig on top of defaultConfig."
    );
    const mergedConfig = merge(defaultConfig, config);

    if (defaultConfig.logger.printRequest) {
      logger.info({ event, context }, "Received request.");
    }

    const response = await resolve(handlerClass)[INVOKE_METHOD_NAME](
      event,
      context,
      mergedConfig
    );

    if (defaultConfig.logger.printResponse) {
      logger.info({ response }, "Returning response.");
    }

    return response;
  };
}

export function mapInvokeMethodParams(
  handler: RestApiHandler,
  context: RestApiContext
): unknown[] {
  const instructions: ParameterInstruction[] =
    Reflect.getOwnMetadata(
      META_REQUEST_MAPPING,
      handler.constructor,
      INVOKE_METHOD_NAME
    ) ?? [];
  logger.info("Mapping Lambda inputs to handler instructions.");

  context.event.headers = Object.entries(context.event.headers).reduce(
    (headers, [headerName, headerValue]) => {
      delete headers[headerName]; // eslint-disable-line no-param-reassign
      return { ...headers, [headerName.toLowerCase()]: headerValue };
    },
    { ...context.event.headers }
  );

  return instructions
    .sort(({ paramIndex: aIndex }, { paramIndex: bIndex }) => aIndex - bIndex)
    .reduce((args: unknown[], instruction, index) => {
      logger.debug({ instruction }, `Executing instruction ${index + 1}.`);

      args.push(evaluateInstruction(instruction, context));

      return args;
    }, []);
}

function evaluateInstruction(
  { type, searchKey, mapsTo, paramIndex }: ParameterInstruction,
  context: RestApiContext
): ParsedEventValue {
  const {
    event: { pathParameters, queryStringParameters, headers, body },
    config: { restApi: config },
  } = context;

  let valueContainer: Record<string, unknown> | string | null;
  let eventValue: RawEventValue;

  switch (mapsTo) {
    case ParameterInstructionTarget.CONTEXT:
      return context;
    case ParameterInstructionTarget.BODY:
      valueContainer = body;
      break;
    case ParameterInstructionTarget.PATH:
      valueContainer = pathParameters;
      break;
    case ParameterInstructionTarget.QUERY:
      valueContainer = queryStringParameters;
      break;
    case ParameterInstructionTarget.HEADER:
      valueContainer = headers;
      break;
    default:
      throw new BigsbyError(`Unimplemented param target: ${mapsTo}`);
  }

  if (mapsTo === ParameterInstructionTarget.BODY) {
    eventValue = valueContainer as string;
  } else if (mapsTo === ParameterInstructionTarget.HEADER) {
    eventValue = (valueContainer as Record<string, RawEventValue>)?.[
      searchKey.toLowerCase() as keyof Record<string, RawEventValue>
    ];
  } else {
    eventValue = (valueContainer as Record<string, RawEventValue>)?.[
      searchKey as keyof Record<string, RawEventValue>
    ];
  }

  if (!eventValue) {
    logger.warn(
      `Field '${searchKey}' doesn't exist in event.${mapsTo}, parameter at index ${paramIndex} will be undefined.`
    );
    return undefined;
  }

  if (!config.request.enableTypeCoercion) {
    logger.debug("Type Coercion disabled, returning pristine event value.");
    return eventValue;
  }

  const parseResult = parseValueAsType(eventValue, type);

  if (parseResult.isSuccess()) {
    return parseResult.value();
  }

  logger.error(parseResult.value());

  throw new RequestInvalidError(
    `Failed to map event.${mapsTo} to parameter index ${paramIndex}.`
  );
}

function parseValueAsType(
  value: string | null,
  type: InferredType | undefined
): Throwable<TypeCoercionError, ParsedEventValue> {
  logger.debug({ type }, "Type Coercion enabled, returning value as type:");

  switch (type) {
    case InferredType.NUMBER:
      return tryParseNumber(value);
    case InferredType.BOOLEAN:
      return success(value === "true");
    case InferredType.OBJECT:
      return tryParseObject(value);
    case InferredType.STRING:
    case InferredType.ARRAY:
    default:
      return success(value);
  }
}

export function addInferredContentTypeBody(
  response: HttpResponse
): HttpResponse {
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

export function transformResponse(
  response: HttpResponse,
  { config: { restApi: config } }: RestApiContext
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
