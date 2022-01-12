import { ParameterInstructionTarget } from "../types";

import { createMappingAnnotationWithSearchKey } from "./utils";

export function Query(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.QUERY,
    name
  );
}
