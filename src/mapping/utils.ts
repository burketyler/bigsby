import { fail, success, Throwable } from "ts-injection";

import { ApiHandler, ApiContext } from "../api";
import { INVOKE_METHOD_NAME } from "../constants";
import { useLogger } from "../logger";
import {
  BigsbyError,
  InjectableMetaTag,
  ParameterInstruction,
  ParameterInstructionTarget,
  RequestParseError,
} from "../types";
import {
  getFunctionParameterNames,
  getInferredTypesForClassMethod,
  parseValueAsType,
} from "../utils";

import { ParsedEventValue, RawEventValue } from "./types";

const { logger } = useLogger();

export function annotateParamMetadata({
  targetClass,
  paramName,
  paramIndex,
  mapsTo,
  searchKey,
}: {
  targetClass: Record<string, unknown>;
  paramName: string;
  paramIndex: number;
  mapsTo: ParameterInstructionTarget;
  searchKey?: string;
}): void {
  getInferredTypesForClassMethod(targetClass, paramName)
    .onSuccess((types) => {
      const instructionList =
        Reflect.getOwnMetadata(
          InjectableMetaTag.REQUEST_MAPPING,
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
        InjectableMetaTag.REQUEST_MAPPING,
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
  targetClass: Record<string, unknown>,
  paramName: string,
  paramIndex: number
) => void {
  return (
    targetClass: Record<string, unknown>,
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

export function parseRequestParams(
  handler: ApiHandler,
  context: ApiContext
): Throwable<RequestParseError, ParsedEventValue[]> {
  logger.info("Mapping Lambda inputs to handler instructions.");

  const instructions: ParameterInstruction[] =
    Reflect.getOwnMetadata(
      InjectableMetaTag.REQUEST_MAPPING,
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
  context: ApiContext
): Throwable<RequestParseError, ParsedEventValue> {
  const {
    config: { api: config },
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

  logger.debug({ type }, "Type Coercion enabled, returning value as type.");
  const parseResult = parseValueAsType<ParsedEventValue>(eventValue, type);

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
  context: ApiContext,
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
