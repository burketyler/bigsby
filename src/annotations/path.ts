import "reflect-metadata";
import { RequestMapTarget } from "../domain/constants";
import applyRequestMappingMetadata from "../functions/addRequestMappingRules";
import { extractParamType } from "../functions/extractParamType";

export function Path(name: string) {
  return (target: any, paramName: string, paramIndex: number) => {
    applyRequestMappingMetadata(target, paramName, {
      paramIndex,
      mapTo: RequestMapTarget.PATH,
      type: extractParamType(target, paramName, paramIndex),
      searchKey: name,
    });
  };
}
