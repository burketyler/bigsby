import {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
} from "aws-lambda";
import { AuthorizerConfig } from "../../functions/createAuthorizer";

export interface AuthorizerContext<EventType = APIGatewayAuthorizerEvent> {
  event: EventType;
  context: APIGatewayEventRequestContext;
  callback: (result: string) => void;
}

export interface LambdaAuthorizerConstructor<
  ConfigType extends AuthorizerConfig
> {
  new (config: ConfigType): LambdaAuthorizer;
}

export interface LambdaAuthorizer {
  authorize(
    context: AuthorizerContext
  ): Promise<APIGatewayAuthorizerResult | void>;
}
