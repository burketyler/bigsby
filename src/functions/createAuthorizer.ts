import {
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { LambdaAuthorizerConstructor } from "../domain/models/lambdaAuthorizer";
import {
  JwksAuthorizerConfig,
  JwtAuthorizerConfig,
} from "../classes/authorizers";

export type AuthorizerConfig = JwksAuthorizerConfig | JwtAuthorizerConfig;

export function createAuthorizer<ConfigType extends AuthorizerConfig>(
  Authorizer: LambdaAuthorizerConstructor<ConfigType>,
  config: ConfigType
) {
  return (
    event: APIGatewayTokenAuthorizerEvent,
    context: APIGatewayEventRequestContext,
    callback: () => void
  ): Promise<APIGatewayAuthorizerResult | void> => {
    return new Authorizer(config).authorize({
      context,
      event,
      callback,
    });
  };
}
