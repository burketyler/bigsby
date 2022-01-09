import { META_REQUEST_MAPPING } from "../../constants";
import { ParameterInstructionTarget } from "../../types";
import {
  getFunctionParameterNames,
  getInferredTypesForClassMethod,
} from "../../utils";

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
          META_REQUEST_MAPPING,
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
        META_REQUEST_MAPPING,
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
