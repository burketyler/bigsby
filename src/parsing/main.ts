import { fail, success, Throwable } from "ts-injection";

import { INVOKE_METHOD_NAME } from "../constants";
import {
  ApiHandler,
  InjectableMetadata,
  ParameterInstruction,
  ParameterInstructionTarget,
  RequestContext,
  RequestParseError,
} from "../types";

import { ParsedEventValue } from "./types";
import {
  annotateParamMetadata,
  createMappingAnnotationWithSearchKey,
  evaluateInstruction,
  sortInstructions,
} from "./utils";

export function Body() {
  return (
    targetClass: Record<string, unknown>,
    paramName: string,
    paramIndex: number
  ): void => {
    annotateParamMetadata({
      targetClass,
      paramName,
      paramIndex,
      mapsTo: ParameterInstructionTarget.BODY,
    });
  };
}

export function Context() {
  return (
    targetClass: Record<string, unknown>,
    paramName: string,
    paramIndex: number
  ): void => {
    annotateParamMetadata({
      targetClass,
      paramName,
      paramIndex,
      mapsTo: ParameterInstructionTarget.CONTEXT,
    });
  };
}

export function Header(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.HEADER,
    name
  );
}

export function Path(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.PATH,
    name
  );
}

export function Query(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.QUERY,
    name
  );
}

export function parseRequestParams(
  handler: ApiHandler,
  context: RequestContext
): Throwable<RequestParseError, ParsedEventValue[]> {
  const { logger } = context.bigsby;

  logger.debug("Mapping Lambda inputs to handler instructions.");

  const instructions: ParameterInstruction[] =
    Reflect.getOwnMetadata(
      InjectableMetadata.REQUEST_MAPPING,
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
