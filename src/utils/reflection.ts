import { PRIMITIVE_TYPES, success, fail, Throwable } from "ts-injection";

import { ApiResponse, BigsbyError, InferredType } from "../types";

/** *
 * Infer a type based on the primitive constructor reference of the class member
 * @param target <- this will be the class instance
 * @param paramName <- this will be the name of the class method
 */
export function getInferredTypesForClassMethod(
  target: Record<string, unknown>,
  paramName: string
): Throwable<BigsbyError, InferredType[]> {
  const { STRING, NUMBER, BOOLEAN, OBJECT, ARRAY } = PRIMITIVE_TYPES;
  const types: (() => unknown)[] = Reflect.getMetadata(
    "design:paramtypes",
    target,
    paramName
  );

  if (!types) {
    return fail(new BigsbyError("Provided class method has no types."));
  }

  return success(
    types.map((type) => {
      switch (type) {
        case NUMBER:
          return InferredType.NUMBER;
        case BOOLEAN:
          return InferredType.BOOLEAN;
        case OBJECT:
          return InferredType.OBJECT;
        case ARRAY:
          return InferredType.ARRAY;
        case STRING:
        default:
          return InferredType.STRING;
      }
    })
  );
}

export function getFunctionParameterNames(fn: unknown): string[] {
  if (typeof fn !== "function") {
    throw new BigsbyError(
      `Input must be of type function. Provided typeof ${typeof fn}.`
    );
  }

  const [argumentString] = Array.from(
    fn.toString().match(/\((?:\w*,?\s*)*\)/) ?? []
  );

  if (!argumentString) {
    throw new BigsbyError("Failed to parse argument string from function.");
  }

  return Array.from(argumentString.matchAll(/\s*,?(\w+)/g)).reduce(
    (args: string[], [, arg]) => {
      args.push(arg);

      return args;
    },
    []
  );
}

export function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

export function isApiResponse(response: unknown): response is ApiResponse {
  return !!(response as ApiResponse)?.statusCode;
}
