import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy"; // eslint-disable-line import/no-unresolved
import { AnySchema, Schema, ValidationError } from "joi";

import { BigsbyConfig, RequestParseError } from "../../types";

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
  context: Context,
  config: BigsbyConfig
) => Promise<HttpResponse>;

export interface RestApiHandler {
  invoke: RestApiInvokeFunction;
}

export interface RestApiContext {
  event: StandardizedEvent;
  context: Context;
  config: BigsbyConfig;
}

export type StandardizedEvent = Omit<APIGatewayProxyEvent, "body"> & {
  body: string | Record<string, unknown> | undefined;
};

export interface RestApiConfig {
  request: {
    enableTypeCoercion: boolean;
    auth?: (context: RestApiContext) => void;
    schema?: Schema<{
      headers?: APIGatewayProxyEvent["headers"];
      body?: APIGatewayProxyEvent["body"];
      queryStringParameters?: APIGatewayProxyEvent["queryStringParameters"];
      pathParameters?: APIGatewayProxyEvent["pathParameters"];
    }>;
  };
  response: {
    enableInferContentType: boolean;
    schema?: {
      [statusCode: number]: Schema<{
        headers?: APIGatewayProxyEvent["headers"];
        body?: APIGatewayProxyEvent["body"];
        queryStringParameters?: APIGatewayProxyEvent["queryStringParameters"];
        pathParameters?: APIGatewayProxyEvent["pathParameters"];
      }>;
    };
    headers?: { [headerName: string]: string };
  };
  lifecycle: {
    onInit?: () => void;
    preInvoke?: (event: APIGatewayProxyEvent, context: Context) => void;
    preAuth?: (context: RestApiContext) => void;
    onAuthFail?: <ErrorType>(error: ErrorType) => void;
    preParse?: (context: RestApiContext) => void;
    preValidate?: (context: RestApiContext) => void;
    onRequestInvalid?: (
      error: ValidationError | RequestParseError
    ) => HttpResponse | void;
    preExecute?: (context: RestApiContext) => void;
    preResponse?: (
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

export type RawEventValue = string | Record<string, unknown> | undefined | null;
