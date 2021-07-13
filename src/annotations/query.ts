import "reflect-metadata";
import applyRequestMappingMetadata from "../functions/addRequestMappingRules";
import { extractParamType } from "../functions/extractParamType";
import { RequestMapTarget } from "../domain/enums/requestMapTarget";
import { getFunctionParamNames } from "../functions/getFunctionParamNames";

export function Query(
  name?: string
): (
  target: Record<string, unknown>,
  paramName: string,
  paramIndex: number
) => void {
  return (
    target: Record<string, unknown>,
    paramName: string,
    paramIndex: number
  ) => {
    const paramNames = getFunctionParamNames(target[paramName]);
    applyRequestMappingMetadata(target, paramName, {
      paramIndex,
      mapTo: RequestMapTarget.QUERY,
      type: extractParamType(target, paramName, paramIndex),
      searchKey: name ?? paramNames[paramIndex],
    });
  };
}
