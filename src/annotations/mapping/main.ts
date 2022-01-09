import { ParameterInstructionTarget } from "../../types";

import {
  annotateParamMetadata,
  createMappingAnnotationWithSearchKey,
} from "./utils";

export function Body(
  targetClass: Record<string, unknown>,
  paramName: string,
  paramIndex: number
): void {
  annotateParamMetadata({
    targetClass,
    paramName,
    paramIndex,
    mapsTo: ParameterInstructionTarget.BODY,
  });
}

export function Context(
  targetClass: Record<string, unknown>,
  paramName: string,
  paramIndex: number
): void {
  annotateParamMetadata({
    targetClass,
    paramName,
    paramIndex,
    mapsTo: ParameterInstructionTarget.CONTEXT,
  });
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
