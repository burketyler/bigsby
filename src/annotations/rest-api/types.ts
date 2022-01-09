import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { AnySchema, ValidationError } from "joi";

import { BigsbyConfig, RequestInvalidError } from "../../types";

export interface HttpResponse extends Omit<APIGatewayProxyResult, "body"> {
  body?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface RestApiHandlerConstructor {
  new (): RestApiHandler;
}

export type RestApiInvokeFunction = (
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => Promise<HttpResponse>;

export type RawRestApiInvokeFunction = (
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  config: BigsbyConfig
) => Promise<HttpResponse>;

export interface RestApiHandler {
  invoke: RestApiInvokeFunction;
}

export interface RestApiContext {
  context: APIGatewayEventRequestContext;
  event: APIGatewayProxyEvent;
  config: BigsbyConfig;
}

interface RequestSchema {
  headers: AnySchema;
  body: AnySchema;
  queryStrings: AnySchema;
  pathParams: AnySchema;
}

interface ResponseSchema {
  [statusCode: number]: string;
}

export interface RestApiConfig {
  request: {
    enableTypeCoercion: boolean;
    schema?: RequestSchema;
  };
  response: {
    enableInferContentType: boolean;
    schema?: ResponseSchema;
    headers?: { [headerName: string]: string };
  };
  lifecycle?: {
    onInit?: () => void;
    onInvoke?: (context: RestApiContext) => void;
    preAuth?: (context: RestApiContext) => void;
    onAuthError?: <ErrorType>(error: ErrorType) => HttpResponse | void;
    preParse?: (context: RestApiContext) => void;
    preValidate?: (context: RestApiContext) => void;
    onRequestInvalid?: (
      error: ValidationError | RequestInvalidError
    ) => HttpResponse | void;
    preExecute?: (context: RestApiContext) => void;
    postExecute?: (
      response: HttpResponse,
      context: RestApiContext
    ) => HttpResponse | void;
    onResponseInvalid?: (error: ValidationError) => HttpResponse | void;
    onError?: (error: unknown) => HttpResponse | void;
  };
}

export enum ContentType {
  APPLICATION_JSON = "application/json",
  TEXT_PLAIN = "text/plain",
  NONE = "none",
}

export type ParsedEventValue =
  | string
  | number
  | boolean
  | never[]
  | Record<string, unknown>
  | RestApiContext
  | undefined
  | null;

export type RawEventValue = string | null;
