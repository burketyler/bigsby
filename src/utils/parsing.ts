import { fail, success, Throwable } from "ts-injection";

import { TypeCoercionError } from "../types";

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
