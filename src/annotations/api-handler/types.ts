import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { Schema, ValidationError } from "joi";

import {
  BigsbyConfig,
  RequestParseError,
  TypeCoercionError,
} from "../../types";

export interface HttpResponse extends Omit<APIGatewayProxyResult, "body"> {
  body?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ApiHandlerConstructor {
  new (): ApiHandler;
}

export type ApiHandlerInvokeFunction = (
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => Promise<HttpResponse>;

export type RawApiHandlerInvokeFunction = (
  event: APIGatewayProxyEvent,
  context: Context,
  config: BigsbyConfig
) => Promise<HttpResponse>;

export interface ApiHandler {
  invoke: ApiHandlerInvokeFunction;
}

export interface ApiHandlerContext {
  event: StandardizedEvent;
  context: Context;
  config: BigsbyConfig;
}

export type StandardizedEvent = Omit<APIGatewayProxyEvent, "body"> & {
  body: string | Record<string, unknown> | undefined;
};

export type RequestValidationSchema = Schema<{
  headers?: APIGatewayProxyEvent["headers"];
  body?: APIGatewayProxyEvent["body"];
  queryStringParameters?: APIGatewayProxyEvent["queryStringParameters"];
  pathParameters?: APIGatewayProxyEvent["pathParameters"];
}>;

export interface ResponseValidationSchemaMap {
  [statusCode: number]: Schema<HttpResponse>;
}

export type AuthMethod = (context: ApiHandlerContext) => void;

export interface ApiHandlerConfig {
  request: {
    enableTypeCoercion: boolean;
    auth?: AuthMethod;
    schema?: RequestValidationSchema;
  };
  response: {
    enableInferContentType: boolean;
    schema?: ResponseValidationSchemaMap;
    headers?: { [headerName: string]: string };
  };
  lifecycle: {
    onInit?: () => void;
    preInvoke?: (event: APIGatewayProxyEvent, context: Context) => void;
    preAuth?: (context: ApiHandlerContext) => void;
    onAuthFail?: <ErrorType>(error: ErrorType) => void;
    preParse?: (context: ApiHandlerContext) => void;
    preValidate?: (context: ApiHandlerContext) => void;
    onRequestInvalid?: (
      error: ValidationError | RequestParseError
    ) => HttpResponse | void;
    preExecute?: (context: ApiHandlerContext) => void;
    preResponse?: (
      response: HttpResponse,
      context: ApiHandlerContext
    ) => HttpResponse | void;
    onResponseInvalid?: (
      error: ValidationError | TypeCoercionError
    ) => HttpResponse | void;
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
  | ApiHandlerContext
  | undefined
  | null;

export type RawEventValue = string | Record<string, unknown> | undefined | null;
