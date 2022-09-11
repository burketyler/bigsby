import { REQUEST_ID_HEADER } from "../constants";
import { BigsbyError, RequestContext, ApiResponse } from "../types";

import { CONTENT_TYPE_HEADER } from "./constants";

export function addTraceIdHeader(
  response: ApiResponse,
  context: RequestContext
): ApiResponse {
  const newHeaders = { ...response.headers };

  newHeaders[REQUEST_ID_HEADER] = context.apiGwContext.awsRequestId;

  return { ...response, headers: newHeaders };
}

export function addConfiguredDefaultHeaders(
  response: ApiResponse,
  context: RequestContext
): ApiResponse {
  const { logger } = context.bigsby;
  const newHeaders = { ...response.headers };

  logger.debug("Adding default headers.", { headers: response.headers });

  Object.entries(response.headers ?? {}).reduce(
    (
      headers: NonNullable<ApiResponse["headers"]>,
      [headerName, headerValue]
    ) => ({
      ...newHeaders,
      [headerName]: headers[headerName] ?? headerValue,
    }),
    newHeaders ?? {}
  );

  return { ...response, headers: newHeaders };
}

export function addContentTypeHeader(
  response: ApiResponse,
  context: RequestContext
): ApiResponse {
  const { logger } = context.bigsby;
  const newHeaders = { ...response.headers };

  logger.debug("Inferring content type.");

  if (newHeaders[CONTENT_TYPE_HEADER.toLowerCase()]) {
    logger.debug("Content-Type header already provided in response, skipping.");
    return response;
  }

  const contentType = inferContentType(response.body);
  logger.debug(`Inferred Content-Type: ${contentType}.`);

  if (contentType) {
    newHeaders[CONTENT_TYPE_HEADER] = contentType;
  }

  return { ...response, headers: newHeaders };
}

function inferContentType(body: unknown): string | undefined {
  switch (typeof body) {
    case "bigint":
    case "number":
      return "text/plain";
    case "string":
      return inferStringContentType(body);
    case "boolean":
    case "object":
      return "application/json";
    case "undefined":
      return undefined;
    case "symbol":
    case "function":
    default:
      throw new BigsbyError(
        `Type of response body is invalid: ${typeof body}. Cannot infer content type.`
      );
  }
}

function inferStringContentType(body: string): string {
  if (body.match(/^<!doctype\s*html>/i)) {
    return "text/html";
  }

  return "text/plain";
}
