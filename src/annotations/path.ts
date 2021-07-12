import "reflect-metadata";
import applyRequestMappingMetadata from "../functions/addRequestMappingRules";
import { extractParamType } from "../functions/extractParamType";
import { RequestMapTarget } from "../domain/enums/requestMapTarget";

export function Path(
  name: string
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
    applyRequestMappingMetadata(target, paramName, {
      paramIndex,
      mapTo: RequestMapTarget.PATH,
      type: extractParamType(target, paramName, paramIndex),
      searchKey: name,
    });
  };
}
