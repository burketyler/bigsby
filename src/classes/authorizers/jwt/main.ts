import { verify } from "jsonwebtoken";
import {
  AuthorizerContext,
  LambdaAuthorizer,
} from "../../../domain/models/lambdaAuthorizer";
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { LambdaLogger } from "../../../domain/models/lambdaLogger";
import { resolve } from "ts-injection";
import { JwtAuthorizerConfig } from "./types";
import {
  createAuthorizerResult,
  extractAuthContext,
  generatePolicyStatements,
  parseMethodArn,
} from "../utils";

export default class JwtAuthorizer implements LambdaAuthorizer {
  private logger?: LambdaLogger;

  constructor(private config: JwtAuthorizerConfig) {
    if (config.logger) {
      this.logger = resolve(config.logger);
    }
  }

  public async authorize(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>
  ): Promise<APIGatewayAuthorizerResult | void> {
    try {
      const {
        secretOrPublicKey,
        verifyOptions,
        statements,
        verifyDecoded,
        principalIdFieldName,
      } = this.config;

      const decoded = verify(
        context.event.authorizationToken,
        secretOrPublicKey,
        verifyOptions
      );
      verifyDecoded?.(decoded);

      const authContext = extractAuthContext(decoded);
      const methodArn = parseMethodArn(context);
      const policyStatements = generatePolicyStatements(methodArn, statements);

      const result = createAuthorizerResult(
        policyStatements,
        authContext,
        principalIdFieldName
      );
      this.logger?.info("User authorized successfully.", result);

      return result;
    } catch (err) {
      this.logger?.error("User authorization failed.", err);

      context.callback("Unauthorized");

      return;
    }
  }
}
