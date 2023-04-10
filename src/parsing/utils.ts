import { APIGatewayProxyEvent } from "aws-lambda";
import { fail, success, Throwable } from "ts-injection";

import {
  ApiEvent,
  BigsbyError,
  InjectableMetadata,
  ParameterInstruction,
  ParameterInstructionTarget,
  RequestContext,
  RequestParseError,
  StandardizedEvent,
} from "../types";
import {
  getFunctionParameterNames,
  getInferredTypesForClassMethod,
  parseValueAsType,
  tryParseObject,
} from "../utils";

import { ParsedEventValue, RawEventValue } from "./types";

export function parseApiGwEvent(event: ApiEvent): StandardizedEvent {
  const isV1 = isV1Event(event);

  const standardEvent = {
    ...event,
    method: isV1
      ? event.httpMethod.toUpperCase()
      : event.requestContext.http.method.toUpperCase(),
    path: isV1 ? event.path : event.requestContext.http.path,
    protocol: isV1
      ? event.requestContext.protocol
      : event.requestContext.http.protocol,
    version: isV1 ? "1.0" : "2.0",
  } as StandardizedEvent;

  standardEvent.headers = Object.entries(event.headers).reduce(
    (headers, [headerName, headerValue]) => {
      delete headers[headerName]; // eslint-disable-line no-param-reassign
      return { ...headers, [headerName.toLowerCase()]: headerValue };
    },
    { ...standardEvent.headers }
  );

  if (event.headers["content-type"] === "application/json") {
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

function isV1Event(event: ApiEvent): event is APIGatewayProxyEvent {
  return !!(event as APIGatewayProxyEvent)?.httpMethod;
}

export function annotateParamMetadata({
  targetClass,
  paramName,
  paramIndex,
  mapsTo,
  searchKey,
}: {
  targetClass: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  paramName: string;
  paramIndex: number;
  mapsTo: ParameterInstructionTarget;
  searchKey?: string;
}): void {
  getInferredTypesForClassMethod(targetClass, paramName)
    .onSuccess((types) => {
      const instructionList =
        Reflect.getOwnMetadata(
          InjectableMetadata.REQUEST_MAPPING,
          targetClass.constructor,
          paramName
        ) ?? [];

      instructionList.push({
        paramIndex,
        mapsTo,
        searchKey,
        type: types[paramIndex],
      });

      Reflect.defineMetadata(
        InjectableMetadata.REQUEST_MAPPING,
        instructionList,
        targetClass.constructor,
        paramName
      );
    })
    .onError((error) => {
      throw error;
    });
}

export function createMappingAnnotationWithSearchKey(
  mapsTo: ParameterInstructionTarget,
  name?: string
): (
  targetClass: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  paramName: string,
  paramIndex: number
) => void {
  return (
    targetClass: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    paramName: string,
    paramIndex: number
  ) => {
    const paramNames = getFunctionParameterNames(targetClass[paramName]);

    annotateParamMetadata({
      targetClass,
      paramName,
      paramIndex,
      mapsTo,
      searchKey: name ?? paramNames[paramIndex],
    });
  };
}

export function sortInstructions(
  instructions: ParameterInstruction[]
): ParameterInstruction[] {
  return instructions.sort((a, b) => a.paramIndex - b.paramIndex);
}

export function evaluateInstruction(
  instruction: ParameterInstruction,
  context: RequestContext
): Throwable<RequestParseError, ParsedEventValue> {
  const { config } = context;
  const { logger } = context.bigsby;
  const { type, searchKey, mapsTo, paramIndex } = instruction;

  if (mapsTo === ParameterInstructionTarget.CONTEXT) {
    return success(context);
  }

  const eventValue = extractEventValue(
    getEventValueContainer(context, mapsTo),
    mapsTo,
    searchKey
  );

  if (!eventValue) {
    logger.debug(
      `Field '${searchKey}' doesn't exist in event.${mapsTo}, parameter at index ${paramIndex} will be undefined.`
    );
    return success(undefined);
  }

  if (!config.request.enableTypeCoercion) {
    logger.debug("Type Coercion disabled, returning pristine event value.");
    return success(eventValue);
  }

  logger.debug(`Type Coercion enabled, returning value as ${type}.`);
  const parseResult = parseValueAsType<ParsedEventValue>(eventValue, type);

  if (parseResult.isError()) {
    logger.error("Error parsing request.", { err: parseResult.value() });

    return fail(
      new RequestParseError(
        `Failed to map event.${mapsTo} to parameter index ${paramIndex}.`
      )
    );
  }

  return success(parseResult.value());
}

function getEventValueContainer(
  context: RequestContext,
  mapsTo: ParameterInstructionTarget
): Record<string, unknown> | RawEventValue {
  const { pathParameters, queryStringParameters, headers, body } =
    context.event;

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
