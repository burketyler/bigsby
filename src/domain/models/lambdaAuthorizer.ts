import {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
} from "aws-lambda";
import { JwtAuthorizerConfig } from "./jwtAuthorizerConfig";

export interface AuthorizerContext<EventType = APIGatewayAuthorizerEvent> {
  event: EventType;
  context: APIGatewayEventRequestContext;
  callback: (result: string) => void;
}

export interface LambdaAuthorizerConstructor {
  new (config: JwtAuthorizerConfig): LambdaAuthorizer;
}

export interface LambdaAuthorizer {
  authorize(context: AuthorizerContext): APIGatewayAuthorizerResult | void;
}
