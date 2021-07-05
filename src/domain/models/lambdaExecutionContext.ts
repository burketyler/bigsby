import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { LambdaHandlerConfig } from "./lambdaHandlerConfig";

export interface LambdaExecutionContext {
  context: APIGatewayEventRequestContext;
  event: APIGatewayProxyEvent;
  config: LambdaHandlerConfig;
}
