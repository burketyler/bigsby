import { fail, success, Throwable } from "ts-injection";

import { InferredType, TypeCoercionError } from "../types";

import { isObject } from "./reflection";

export function tryStringify(
  value: unknown
): Throwable<TypeCoercionError, string | undefined> {
  try {
    switch (typeof value) {
      case "string":
      case "undefined":
        return success(value);
      case "bigint":
      case "number":
      case "boolean":
        return success(value.toString());
      case "object":
        return success(JSON.stringify(value));
      case "function":
      case "symbol":
      default:
        return fail(
          new TypeCoercionError(`Invalid value type: typeof ${typeof value}.`)
        );
    }
  } catch (error) {
    return fail(new TypeCoercionError(error.message));
  }
}

export function tryParseNumber(
  value: unknown
): Throwable<TypeCoercionError, number> {
  try {
    const parsed = Number(value);

    return Number.isNaN(parsed)
      ? fail(new TypeCoercionError("Value isNan."))
      : success(parsed);
  } catch (error) {
    return fail(new TypeCoercionError(error.message));
  }
}

export function tryParseObject(
  value: unknown
): Throwable<TypeCoercionError, Record<string, unknown>> {
  try {
    return success(JSON.parse(value as string));
  } catch (error) {
    return fail(new TypeCoercionError(error.message));
  }
}

export function parseValueAsType<ParsedType>(
  value: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  type: InferredType | undefined
): Throwable<
  TypeCoercionError,
  | ParsedType
  | string
  | number
  | boolean
  | never[]
  | Record<string, unknown>
  | undefined
  | null
> {
  switch (type) {
    case InferredType.NUMBER:
      return tryParseNumber(value);
    case InferredType.BOOLEAN:
      return success(value === "true");
    case InferredType.ARRAY:
    case InferredType.OBJECT:
      return isObject(value) || Array.isArray(value)
        ? success(value)
        : tryParseObject(value);
    case InferredType.STRING:
    default:
      return success(value);
  }
}
