import "reflect-metadata";
import applyRequestMappingMetadata from "../functions/addRequestMappingRules";
import { extractParamType } from "../functions/extractParamType";
import { RequestMapTarget } from "../domain/enums/requestMapTarget";

export function Context(
  target: Record<string, unknown>,
  paramName: string,
  paramIndex: number
): void {
  applyRequestMappingMetadata(target, paramName, {
    paramIndex,
    mapTo: RequestMapTarget.CONTEXT,
    type: extractParamType(target, paramName, paramIndex),
  });
}
