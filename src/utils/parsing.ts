import { fail, success, Throwable } from "ts-injection";

import { TypeCoercionError } from "../types";

export function tryStringifyResponseBody(
  body: unknown
): Throwable<TypeCoercionError, string | undefined> {
  try {
    switch (typeof body) {
      case "string":
      case "undefined":
        return success(body);
      case "bigint":
      case "number":
      case "boolean":
        return success(body.toString());
      case "object":
        return success(JSON.stringify(body));
      case "function":
      case "symbol":
      default:
        return fail(
          new TypeCoercionError(`Invalid body type: typeof ${typeof body}.`)
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
