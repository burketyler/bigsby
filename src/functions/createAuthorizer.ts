import {
  APIGatewayAuthorizerResult,
  APIGatewayEventRequestContext,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import {
  LambdaAuthorizer,
  LambdaAuthorizerConstructor,
} from "../domain/models/lambdaAuthorizer";
import { JwtAuthorizerConfig } from "../domain/models/jwtAuthorizerConfig";
import { resolve } from "ts-injection";

export function createAuthorizer(
  Authorizer: LambdaAuthorizerConstructor,
  config: JwtAuthorizerConfig
) {
  return (
    event: APIGatewayTokenAuthorizerEvent,
    context: APIGatewayEventRequestContext,
    callback: () => void
  ): APIGatewayAuthorizerResult | void => {
    return resolve<LambdaAuthorizer>(Authorizer).authorize(
      { context, event, callback },
      config
    );
  };
}
