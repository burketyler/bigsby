import { ParameterInstructionTarget } from "../types";

import { annotateParamMetadata } from "./utils";

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
