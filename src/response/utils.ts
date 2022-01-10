import { ValidationError } from "joi";

import { useLogger } from "../logger";
import { ResponseInvalidError } from "../types";
import { tryStringifyResponseBody } from "../utils";

export function stringifyBodyWithDefault(
  body: unknown,
  defaultObject: unknown
): string | undefined {
  return tryStringifyResponseBody(body)
    .onSuccess((bodyString) => bodyString)
    .onError(() => JSON.stringify(defaultObject))
    .output();
}

export function stringifyBody(body: unknown): string | undefined {
  return tryStringifyResponseBody(body)
    .onSuccess((stringBody) => stringBody)
    .onError((error) => {
      useLogger().error(error);
      throw new ResponseInvalidError(
        new ValidationError(
          "Invalid response body, unable to stringify.",
          body,
          body
        )
      );
    })
    .output();
}
