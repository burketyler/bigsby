import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { LambdaResponse } from "../http/lambdaResponse";
import { LambdaConfig } from "./bigsbyConfig";

export type RawHandlerFn = (
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  config: LambdaConfig
) => Promise<LambdaResponse>;
