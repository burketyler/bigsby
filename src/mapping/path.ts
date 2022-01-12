import { ParameterInstructionTarget } from "../types";

import { createMappingAnnotationWithSearchKey } from "./utils";

export function Path(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.PATH,
    name
  );
}
