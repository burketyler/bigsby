import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Context,
} from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { AnySchema, Schema, ValidationError } from "joi";

import { BigsbyConfig } from "../config";
import { RequestParseError, TypeCoercionError } from "../types";

export type HandlerClassesInput =
  | ApiHandlerConstructor
  | { [VersionId: string]: ApiHandlerConstructor }
  | ApiHandlerConstructor[];

export interface HttpResponse extends Omit<APIGatewayProxyResult, "body"> {
  body?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ApiHandlerConstructor {
  new (): ApiHandler;
}

export type ApiHandlerInvokeFunction = (
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => Promise<HttpResponse>;

export type RawHandlerInvokeFunction = (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  context: Context,
  config: BigsbyConfig
) => Promise<HttpResponse>;

export interface ApiHandler {
  invoke: ApiHandlerInvokeFunction;
}

export interface ApiContext {
  event: StandardizedEvent;
  context: Context;
  config: BigsbyConfig;
}

export type StandardizedEvent = Omit<
  APIGatewayProxyEvent | APIGatewayProxyEventV2,
  "body"
> & {
  body: string | Record<string, unknown> | undefined;
};

export type RequestValidationSchema = {
  body?: AnySchema;
  headers?: AnySchema;
  pathParameters?: AnySchema;
  queryStringParameters?: AnySchema;
};

export interface ResponseValidationSchemaMap {
  [statusCode: number]: Schema<HttpResponse>;
}

export type AuthMethod = (context: ApiContext) => void;

export enum VersioningMethod {
  HEADER = "HEADER",
  PATH = "PATH",
}

export interface ApiConfig {
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
  versioning?: {
    method: VersioningMethod;
    key: string;
    defaultVersion: string;
  };
  lifecycle?: {
    onInit?: () => void;
    preInvoke?: (
      event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
      context: Context
    ) => void;
    preAuth?: (context: ApiContext) => void;
    onAuthFail?: <ErrorType>(error: ErrorType) => void;
    preParse?: (context: ApiContext) => void;
    preValidate?: (context: ApiContext) => void;
    onRequestInvalid?: (
      error: ValidationError | RequestParseError
    ) => HttpResponse | void;
    preExecute?: (context: ApiContext) => void;
    preResponse?: (
      response: HttpResponse,
      context: ApiContext
    ) => HttpResponse | void;
    onResponseInvalid?: (
      error: ValidationError | TypeCoercionError
    ) => HttpResponse | void;
    onError?: (error: unknown) => HttpResponse | void;
  };
}
