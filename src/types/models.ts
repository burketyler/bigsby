/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Callback,
  Context,
} from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { AnySchema, Schema, ValidationError } from "joi";

import { BigsbyInstance } from "../bigsby";
import { ResponseBuilder } from "../response";

import { InferredType, ParameterInstructionTarget } from "./enums";
import {
  AuthenticationError,
  RequestInvalidError,
  RequestParseError,
  ResponseInvalidError,
  TypeCoercionError,
} from "./errors";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ParameterInstruction {
  paramIndex: number;
  mapsTo: ParameterInstructionTarget;
  searchKey: string;
  type?: InferredType;
}

export type ApiEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2;

export type HandlerFunction = (
  event: ApiEvent,
  context: Context,
  callback?: Callback<ApiResponse>
) => Promise<ApiResponse>;

export type LifecycleErrors =
  | AuthenticationError
  | ResponseInvalidError
  | RequestInvalidError
  | RequestParseError;

export type HandlerClassesInput =
  | ApiHandlerConstructor
  | { [VersionId: string]: ApiHandlerConstructor }
  | ApiHandlerConstructor[];

export interface ApiResponse extends Omit<APIGatewayProxyResult, "body"> {
  body?: any;
}

export interface ApiErrorResponseBody {
  code: number;
  type: string;
  message: string;
}

export interface ApiHandlerConstructor {
  new (...args: any[]): ApiHandler;
}

export type ApiHandlerInvokeFunction = (
  ...args: any[]
) => Promise<any | ApiResponse>;

export type RawHandlerInvokeFunction = (
  event: ApiEvent,
  context: Context,
  config: ApiConfig
) => Promise<any | ApiResponse>;

export interface ApiHandler {
  invoke: ApiHandlerInvokeFunction;
}

export interface RequestContext extends Record<string, any> {
  rawEvent: APIGatewayProxyEvent | APIGatewayProxyEventV2;
  event: StandardizedEvent;
  apiGwContext: Context;
  config: ApiConfig;
  bigsby: BigsbyInstance;
}

export type StandardizedEvent = Omit<ApiEvent, "body"> & {
  body: string | Record<string, unknown> | undefined;
  method: string;
  path: string;
  protocol: string;
  version: "1.0" | "2.0";
};

export type RequestValidationSchema = {
  body?: AnySchema;
  headers?: AnySchema;
  pathParameters?: AnySchema;
  queryStringParameters?: AnySchema;
};

export interface ResponseValidationSchemaMap {
  [statusCode: number]: Schema<ApiResponse>;
}

export type Authenticator = (context: RequestContext) => Promise<void>;

export type AuthMethod = Authenticator | AuthSchemeName;

export type AuthSchemeName = string;

export interface AuthScheme {
  name: AuthSchemeName;
  authenticator: Authenticator;
}

export enum VersioningMethod {
  HEADER = "HEADER",
  PATH = "PATH",
}

export type BigsbyPluginFunction = (
  bigsby: BigsbyInstance,
  options?: Record<string, unknown>
) => Promise<void>;

export interface BigsbyPlugin {
  name: string;
  onRegister: BigsbyPluginFunction;
}

export interface BigsbyPluginRegistration {
  plugin: BigsbyPlugin;
  options?: Record<string, unknown>;
}

export type ApiLifecycle = Required<Required<BigsbyConfig["api"]>["lifecycle"]>;

export type ApiHookNames = keyof ApiLifecycle;

export interface BigsbyConfig {
  api: ApiConfig;
}

export type HookChain<HookMethod> = HookMethod[];

export type HookResult = {
  response: ResponseBuilder;
  immediate?: boolean;
} | void;

export type HookInput<InputType> = InputType & { prevResult?: HookResult };

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
    onInit?: HookChain<(inputs: { bigsby: BigsbyInstance }) => Promise<void>>;
    preInvoke?: HookChain<
      (
        inputs: HookInput<{
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    preAuth?: HookChain<
      (
        inputs: HookInput<{
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    onAuthFail?: HookChain<
      <ErrorType>(
        inputs: HookInput<{
          error: ErrorType;
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    preParse?: HookChain<
      (
        inputs: HookInput<{
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    preValidate?: HookChain<
      (
        inputs: HookInput<{
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    onRequestInvalid?: HookChain<
      (
        inputs: HookInput<{
          error: ValidationError | RequestParseError;
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    preExecute?: HookChain<
      (
        inputs: HookInput<{
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    preResponse?: HookChain<
      (
        inputs: HookInput<{
          response: ApiResponse;
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    onResponseInvalid?: HookChain<
      (
        inputs: HookInput<{
          error: ValidationError | TypeCoercionError;
          context: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
    onError?: HookChain<
      (
        inputs: HookInput<{
          error: unknown;
          context?: RequestContext;
        }>
      ) => Promise<HookResult>
    >;
  };
}
