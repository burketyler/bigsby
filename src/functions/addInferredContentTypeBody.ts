import { LambdaResponse } from "../domain/http/lambdaResponse";
import { ContentType } from "../domain/enums/contentType";
import { BigsbyHeaders } from "../domain/models/bigsbyHeaders";

export function addInferredContentTypeBody(
  response: LambdaResponse
): LambdaResponse {
  const body = extractBodyIfFunction(response.body);
  const contentType = inferContentType(body);
  response.headers = addContentTypeHeader(contentType, response.headers);
  response.body = prepareResponseBody(contentType, body);
  return response;
}

function extractBodyIfFunction(body: unknown): unknown {
  let loops = 0;
  let parsedBody = body;
  while (typeof parsedBody === "function" && loops < 20) {
    parsedBody = parsedBody();
    loops++;
  }
  return parsedBody;
}

function inferContentType(body: unknown): ContentType {
  switch (typeof body) {
    case "bigint":
    case "number":
    case "string":
      return ContentType.TEXT;
    case "boolean":
    case "object":
      return ContentType.JSON;
    case "function":
    case "undefined":
      return ContentType.NONE;
    case "symbol":
    default:
      throw new Error(
        `Invalid body type ${typeof body}, cannot infer content type.`
      );
  }
}

function addContentTypeHeader(
  contentType: ContentType,
  headers: BigsbyHeaders
): BigsbyHeaders {
  switch (contentType) {
    case ContentType.JSON:
      headers["Content-Type"] = "application/json";
      return headers;
    case ContentType.TEXT:
      headers["Content-Type"] = "text/plain";
      return headers;
    case ContentType.NONE:
      return headers;
  }
}

function prepareResponseBody(
  contentType: ContentType,
  body: unknown
): string | Record<string, unknown> | undefined {
  switch (contentType) {
    case ContentType.TEXT:
      return `${body}`;
    case ContentType.JSON:
      return JSON.stringify(body);
    case ContentType.NONE:
      return undefined;
  }
}
