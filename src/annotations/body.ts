import "reflect-metadata";
import { RequestMapTarget } from "../domain/constants";
import applyRequestMappingMetadata from "../functions/addRequestMappingRules";
import { extractParamType } from "../functions/extractParamType";

export function Body(target: any, paramName: string, paramIndex: number) {
  applyRequestMappingMetadata(target, paramName, {
    paramIndex,
    mapTo: RequestMapTarget.BODY,
    type: extractParamType(target, paramName, paramIndex),
  });
}
