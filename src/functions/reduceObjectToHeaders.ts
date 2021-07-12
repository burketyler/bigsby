import { BigsbyHeaders } from "../domain/models/bigsbyHeaders";

export function reduceObjectToHeaders(
  object: BigsbyHeaders = {},
  existingHeaders: BigsbyHeaders = {}
): BigsbyHeaders {
  return Object.entries(object).reduce(
    (newHeaders: BigsbyHeaders, [name, value]) => {
      newHeaders[name] = value;
      return newHeaders;
    },
    existingHeaders
  );
}
