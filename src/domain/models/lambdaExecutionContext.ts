import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { LambdaConfig } from "./bigsbyConfig";

export interface LambdaExecutionContext {
  context: APIGatewayEventRequestContext;
  event: APIGatewayProxyEvent;
  config: LambdaConfig;
}
