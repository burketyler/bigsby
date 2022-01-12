import { fail, success, Throwable } from "ts-injection";

import { HttpResponse } from "../api";
import { BigsbyConfig } from "../config";
import { useLogger } from "../logger";
import {
  ResponseParseError,
  TypeCoercionError,
  ContentType,
  BigsbyError,
} from "../types";
import { tryStringify } from "../utils";

const { logger } = useLogger();

export function transformResponse(
  response: HttpResponse,
  { api: config }: BigsbyConfig
): Throwable<TypeCoercionError, HttpResponse> {
  let enrichedResponse: HttpResponse = { ...response };

  logger.info("Transforming handler response.");

  if (config.response.headers) {
    enrichedResponse = addResponseHeaders(response, config.response.headers);
  }

  if (config.response.enableInferContentType) {
    enrichedResponse = addInferredContentTypeBody(response);
  }

  const stringifyResult = tryStringify(enrichedResponse.body);

  if (stringifyResult.isError()) {
    logger.error(stringifyResult.value(), "Failed to stringify response.");
    return fail(new ResponseParseError());
  }

  return success({ ...enrichedResponse, body: stringifyResult.value() });
}

function addResponseHeaders(
  response: HttpResponse,
  headersToAdd: { [headerName: string]: string }
): HttpResponse {
  logger.debug({ headers: headersToAdd }, "Adding default headers.");

  return {
    ...response,
    headers: Object.entries(headersToAdd).reduce(
      (
        newHeaders: NonNullable<HttpResponse["headers"]>,
        [headerName, headerValue]
      ) => ({
        ...newHeaders,
        [headerName]: newHeaders[headerName] ?? headerValue,
      }),
      response.headers ?? {}
    ),
  };
}

function addInferredContentTypeBody(response: HttpResponse): HttpResponse {
  logger.info("Inferring content type.");

  if (response.headers?.["content-type"]) {
    logger.debug("Content-Type header already provided in response, skipping.");
    return response;
  }

  const contentType = inferContentType(response.body);
  logger.debug({ contentType }, "Using Content-Type.");

  return {
    ...response,
    headers: addContentTypeToHeaders(contentType, response.headers ?? {}),
  };
}

function inferContentType(body: unknown): ContentType {
  switch (typeof body) {
    case "bigint":
    case "number":
    case "string":
      return ContentType.TEXT_PLAIN;
    case "boolean":
    case "object":
      return ContentType.APPLICATION_JSON;
    case "undefined":
      return ContentType.NONE;
    case "symbol":
    case "function":
    default:
      throw new BigsbyError(
        `Invalid body type ${typeof body}, cannot infer content type.`
      );
  }
}

function addContentTypeToHeaders(
  contentType: ContentType,
  headers: HttpResponse["headers"]
): HttpResponse["headers"] {
  const headerName = "Content-Type";

  switch (contentType) {
    case ContentType.APPLICATION_JSON:
      return { ...headers, [headerName]: "application/json" };
    case ContentType.TEXT_PLAIN:
      return { ...headers, [headerName]: "text/plain" };
    case ContentType.NONE:
    default:
      return headers;
  }
}
