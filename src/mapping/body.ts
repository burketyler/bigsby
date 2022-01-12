import { ParameterInstructionTarget } from "../types";

import { annotateParamMetadata } from "./utils";

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
