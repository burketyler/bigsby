import {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { JwtAuthorizerConfig } from "./jwtAuthorizerConfig";

export interface AuthorizerContext<EventType = APIGatewayAuthorizerEvent> {
  event: EventType;
  context: APIGatewayEventRequestContext;
  callback: (result: string) => void;
}

export interface LambdaAuthorizerConstructor {
  new (
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>,
    config: JwtAuthorizerConfig
  ): LambdaAuthorizer;
}

export interface LambdaAuthorizer {
  authorize(
    context: AuthorizerContext,
    config: JwtAuthorizerConfig
  ): APIGatewayAuthorizerResult | void;
}
