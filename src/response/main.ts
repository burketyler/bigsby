import cloneDeep from "clone-deep";
import { constants } from "http2";
import { fail, success, Throwable } from "ts-injection";

import {
  ApiErrorResponseBody,
  ApiResponse,
  RequestContext,
  ResponseParseError,
  TypeCoercionError,
} from "../types";
import { isApiResponse, tryStringify } from "../utils";

import { DEFAULT_RESPONSE_MAP } from "./constants";
import { ResponseValues } from "./types";
import {
  addContentTypeHeader,
  addConfiguredDefaultHeaders,
  addTraceIdHeader,
} from "./utils";

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_PERMANENT_REDIRECT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NO_CONTENT,
} = constants;

export function ok(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_OK).build();
}

export function noContent(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_NO_CONTENT).build();
}

export function created(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_CREATED).build();
}

export function redirect(location: string): ApiResponse {
  return new ResponseBuilder()
    .statusCode(HTTP_STATUS_PERMANENT_REDIRECT)
    .header("Location", location)
    .build();
}

export function internalError(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body)
    .statusCode(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    .build();
}

export function badRequest(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_BAD_REQUEST).build();
}

export function notFound(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_NOT_FOUND).build();
}

export function unauthorized(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_UNAUTHORIZED).build();
}

export function forbidden(body?: ApiResponse["body"]): ApiResponse {
  return new ResponseBuilder(body).statusCode(HTTP_STATUS_FORBIDDEN).build();
}

export function invalidVersion(message: string): ApiResponse {
  return badRequest({
    code: "INVALID_VERSION",
    message,
    url: createErrorUrl(400),
  } as ApiErrorResponseBody);
}

function createErrorUrl(statusCode: number): string {
  return `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${statusCode}`;
}

export class ResponseBuilder {
  private readonly response: ApiResponse;

  constructor();
  constructor(body: ApiResponse["body"]);
  constructor(apiResponse: ApiResponse);
  constructor(bodyOrApiResponse?: ApiResponse["body"] | ResponseBuilder) {
    if (isApiResponse(bodyOrApiResponse)) {
      this.response = bodyOrApiResponse;
    } else {
      this.response = {
        body: bodyOrApiResponse,
        statusCode: HTTP_STATUS_OK,
      };
    }
  }

  public build(): ApiResponse {
    return this.response;
  }

  public statusCode(statusCode: number): ResponseBuilder {
    this.response.statusCode = statusCode;

    return this;
  }

  public header(
    headerName: string,
    value: string | number | boolean
  ): ResponseBuilder {
    this.response.headers = this.response.headers ?? {};
    this.response.headers[headerName] = value;

    return this;
  }

  public headers(headers: ResponseValues["headers"]): ResponseBuilder {
    this.response.headers = headers;

    return this;
  }

  public multiValueHeader(
    headerName: string,
    values: (string | number | boolean)[]
  ): ResponseBuilder {
    this.response.multiValueHeaders = this.response.multiValueHeaders ?? {};
    this.response.multiValueHeaders[headerName] = values;

    return this;
  }

  public multiValueHeaders(
    headers: ApiResponse["multiValueHeaders"]
  ): ResponseBuilder {
    this.response.multiValueHeaders = headers;

    return this;
  }

  public encoded(): ResponseBuilder {
    this.response.isBase64Encoded = true;

    return this;
  }

  public body(body: ApiResponse["body"]): ResponseBuilder {
    this.response.body = body;

    return this;
  }
}

export function transformResponse(
  response: ApiResponse,
  context: RequestContext
): Throwable<TypeCoercionError, ApiResponse> {
  const { config } = context;
  const { logger } = context.bigsby;

  let enrichedResponse: ApiResponse = cloneDeep(response);

  logger.debug("Transforming handler response.");

  enrichedResponse = addTraceIdHeader(enrichedResponse, context);

  if (config.response.headers) {
    enrichedResponse = addConfiguredDefaultHeaders(enrichedResponse, context);
  }

  if (config.response.enableInferContentType) {
    enrichedResponse = addContentTypeHeader(enrichedResponse, context);
  }

  if (enrichedResponse.body === undefined) {
    addDefaultBody(enrichedResponse);
  }

  const stringifyResult = tryStringify(enrichedResponse.body);

  if (stringifyResult.isError()) {
    logger.error("Failed to stringify response.", {
      err: stringifyResult.value(),
    });
    return fail(new ResponseParseError());
  }

  enrichedResponse.body = stringifyResult.value();

  return success(enrichedResponse);
}

function addDefaultBody(response: ApiResponse): void {
  const statusCodeDetails = DEFAULT_RESPONSE_MAP[response.statusCode];

  if (statusCodeDetails) {
    response.body = {
      code: statusCodeDetails.code,
      message: statusCodeDetails.message,
      url: createErrorUrl(response.statusCode),
    } as ApiErrorResponseBody;
  }
}
