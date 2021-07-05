import { LambdaHandler } from "../domain/models/lambdaHandler";
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { ApiGatewayLambdaResponse } from "../domain/http/apiGatewayLambdaResponse";
import { RawHandlerFn } from "../domain/models/rawHandlerFn";
import { LambdaHandlerConfig } from "../domain/models/lambdaHandlerConfig";

export type Headers = { [key: string]: string };

export function enrichResponseHeaders(handler: LambdaHandler): void {
  const handlerFn: Function = handler.execute;
  (handler.execute as RawHandlerFn) = async (
    event: APIGatewayProxyEvent,
    context: APIGatewayEventRequestContext,
    config: LambdaHandlerConfig
  ) => {
    const response: ApiGatewayLambdaResponse = await handlerFn.apply(handler, [
      event,
      context,
      config,
    ]);
    response.headers = evaluateHeaders(context, response.headers);
    return response;
  };
}

function evaluateHeaders(
  context: APIGatewayEventRequestContext,
  headers: Headers
): Headers {
  return Object.entries({
    "Access-Control-Allow-Origin": undefined,
    "Strict-Transport-Security": "max-age=3600; includeSubDomains",
    "Set-Cookie": "Secure; HttpOnly",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "nocache",
    "X-Frame-Options": "deny",
    "X-XSS-Protection": "1; mode=block",
    "X-AWS-Request-ID": getRequestId(context),
  }).reduce((newHeaders: Headers, [name, value]) => {
    const headerValue = determineHeader(name, value);
    if (headerValue) {
      headers[name] = headerValue;
    }
    return headers;
  }, headers);
}

function getRequestId(
  context: APIGatewayEventRequestContext
): string | undefined {
  return (context["awsRequestId" as keyof APIGatewayEventRequestContext] ??
    context.requestId) as string;
}

function determineHeader(headerName: string, defaultValue?: string): string {
  const envName = headerName
    .split("-")
    .map((str) => str.toUpperCase())
    .join("_");
  return process.env[envName] ?? defaultValue ?? "";
}
