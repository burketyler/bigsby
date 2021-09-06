import {
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { LambdaAuthorizerConstructor } from "../domain/models/lambdaAuthorizer";
import { JwtAuthorizerConfig } from "../domain/models/jwtAuthorizerConfig";

export function createAuthorizer(
  Authorizer: LambdaAuthorizerConstructor,
  config: JwtAuthorizerConfig
) {
  return (
    event: APIGatewayTokenAuthorizerEvent,
    context: APIGatewayEventRequestContext,
    callback: () => void
  ): APIGatewayAuthorizerResult | void => {
    return new Authorizer(config).authorize({
      context,
      event,
      callback,
    });
  };
}
