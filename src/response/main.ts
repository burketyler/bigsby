import { constants } from "http2";

import { HttpResponse } from "../annotations/rest-api";
import { tryStringifyResponseBody } from "../utils";

const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
} = constants;

export function okResponse({
  body,
  headers,
  multiValueHeaders,
  isBase64Encoded,
}: Omit<HttpResponse, "statusCode"> = {}): HttpResponse {
  return {
    headers,
    multiValueHeaders,
    isBase64Encoded,
    statusCode: HTTP_STATUS_OK,
    body: tryStringifyResponseBody(body)
      .onSuccess((stringBody) => stringBody)
      .onError(() => undefined)
      .output(),
  };
}

export function internalError({
  body,
  headers,
  multiValueHeaders,
  isBase64Encoded,
}: Omit<HttpResponse, "statusCode"> = {}): HttpResponse {
  return {
    headers,
    multiValueHeaders,
    isBase64Encoded,
    statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
    body: tryStringifyResponseBody(body)
      .onSuccess((bodyString) => bodyString)
      .onError(() =>
        JSON.stringify({
          statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          error: "InternalServerError",
          message: "Internal server error.",
        })
      )
      .output(),
  };
}

export function badRequest({
  body,
  headers,
  multiValueHeaders,
  isBase64Encoded,
}: Omit<HttpResponse, "statusCode"> = {}): HttpResponse {
  return {
    headers,
    multiValueHeaders,
    isBase64Encoded,
    statusCode: HTTP_STATUS_BAD_REQUEST,
    body: tryStringifyResponseBody(body)
      .onSuccess((bodyString) => bodyString)
      .onError(() =>
        JSON.stringify({
          statusCode: HTTP_STATUS_BAD_REQUEST,
          error: "BadRequest",
          message: "Bad request.",
        })
      )
      .output(),
  };
}
