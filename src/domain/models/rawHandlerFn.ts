import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { ApiGatewayLambdaResponse } from "../http/apiGatewayLambdaResponse";
import { LambdaHandlerConfig } from "./lambdaHandlerConfig";

export type RawHandlerFn = (
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  config: LambdaHandlerConfig
) => Promise<ApiGatewayLambdaResponse>;
