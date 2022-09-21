/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Callback,
  Context as ApiGatewayContext,
} from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { AnySchema, Schema, ValidationError } from "joi";
import { LogLevel } from "ts-injection";

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
  context: ApiGatewayContext,
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
  code: string;
  message: string;
  url: string;
}

export interface ApiHandlerConstructor {
  new (...args: any[]): ApiHandler;
}

export type ApiHandlerInvokeFunction = (
  ...args: any[]
) => Promise<any | ApiResponse>;

export type RawHandlerInvokeFunction = (
  event: ApiEvent,
  context: ApiGatewayContext,
  config: ApiConfig
) => Promise<any | ApiResponse>;

export interface ApiHandler {
  invoke: ApiHandlerInvokeFunction;
}

export interface RequestContext {
  rawEvent: APIGatewayProxyEvent | APIGatewayProxyEventV2;
  event: StandardizedEvent;
  apiGwContext: ApiGatewayContext;
  config: ApiConfig;
  bigsby: BigsbyInstance;
  state: Record<string, any>;
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
  logging: LoggingConfig;
}

export type HookChain<HookMethod> = HookMethod[];

export type HookResult = {
  response: ResponseBuilder;
  immediate?: boolean;
} | void;

export type HookInput<InputType> = InputType & {
  response?: ResponseBuilder;
};

export interface LoggingConfig {
  enabled: boolean;
  level: LogLevel;
  logger?: BigsbyLogger;
}

export interface BigsbyLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

export type LogFunction = (msg: string, ...meta: any[]) => void;

type ContextInputs = HookInput<{
  context: RequestContext;
}>;

export type OnInitInputs = { bigsby: BigsbyInstance };
export type OnInitHook = HookChain<(inputs: OnInitInputs) => Promise<void>>;

export type PreInvokeInputs = ContextInputs;
export type PreInvokeHook = HookChain<
  (inputs: PreInvokeInputs) => Promise<HookResult>
>;

export type PreAuthInputs = ContextInputs;
export type PreAuthHook = HookChain<
  (inputs: PreAuthInputs) => Promise<HookResult>
>;

export type OnAuthFailInputs<ErrorType> = HookInput<{
  error: ErrorType;
  context: RequestContext;
}>;
export type OnAuthFailHook = HookChain<
  <ErrorType>(inputs: OnAuthFailInputs<ErrorType>) => Promise<HookResult>
>;

export type PreParseInputs = ContextInputs;
export type PreValidateInputs = ContextInputs;
export type OnRequestInvalidInputs = HookInput<{
  error: ValidationError | RequestParseError;
  context: RequestContext;
}>;
export type PreExecuteInputs = ContextInputs;
export type PreResponseInputs = HookInput<{
  handlerResponse: ApiResponse;
  context: RequestContext;
}>;
export type OnResponseInvalidInputs = HookInput<{
  error: ValidationError | TypeCoercionError;
  context: RequestContext;
}>;
export type OnErrorInputs = HookInput<{
  error: unknown;
  context: RequestContext;
}>;

export type PreParseHook = HookChain<
  (inputs: PreParseInputs) => Promise<HookResult>
>;
export type PreValidateHook = HookChain<
  (inputs: PreValidateInputs) => Promise<HookResult>
>;
export type OnRequestInvalidHook = HookChain<
  (inputs: OnRequestInvalidInputs) => Promise<HookResult>
>;
export type PreExecuteHook = HookChain<
  (inputs: PreExecuteInputs) => Promise<HookResult>
>;
export type PreResponseHook = HookChain<
  (inputs: PreResponseInputs) => Promise<HookResult>
>;
export type OnResponseInvalidHook = HookChain<
  (inputs: OnResponseInvalidInputs) => Promise<HookResult>
>;
export type OnErrorHook = HookChain<
  (inputs: OnErrorInputs) => Promise<HookResult>
>;

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
    onInit?: OnInitHook;
    preInvoke?: PreInvokeHook;
    preAuth?: PreAuthHook;
    onAuthFail?: OnAuthFailHook;
    preParse?: PreParseHook;
    preValidate?: PreValidateHook;
    onRequestInvalid?: OnRequestInvalidHook;
    preExecute?: PreExecuteHook;
    preResponse?: PreResponseHook;
    onResponseInvalid?: OnResponseInvalidHook;
    onError?: OnErrorHook;
  };
}
