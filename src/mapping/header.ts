import { ParameterInstructionTarget } from "../types";

import { createMappingAnnotationWithSearchKey } from "./utils";

export function Header(name?: string) {
  return createMappingAnnotationWithSearchKey(
    ParameterInstructionTarget.HEADER,
    name
  );
}
