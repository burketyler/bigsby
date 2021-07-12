import { APIGatewayEventRequestContext } from "aws-lambda";
import { LambdaResponse } from "../domain/http/lambdaResponse";
import { BigsbyHeaders } from "../domain/models/bigsbyHeaders";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { LambdaConfig } from "../domain/models/bigsbyConfig";
import { reduceObjectToHeaders } from "./reduceObjectToHeaders";

export function addAdditionalHeaders(
  response: LambdaResponse,
  context: LambdaExecutionContext
): LambdaResponse {
  response.headers = addConfigHeaders(context.config, response.headers);
  response.headers = addRequestId(context.context, response.headers);
  return response;
}

function addConfigHeaders(
  config: LambdaConfig,
  headers: BigsbyHeaders
): BigsbyHeaders {
  return reduceObjectToHeaders(config.response?.headers?.additional, headers);
}

function addRequestId(
  context: APIGatewayEventRequestContext,
  headers: BigsbyHeaders
): BigsbyHeaders {
  headers["X-AWS-Request-ID"] = (context[
    "awsRequestId" as keyof APIGatewayEventRequestContext
  ] ?? context.requestId) as string;
  return headers;
}
