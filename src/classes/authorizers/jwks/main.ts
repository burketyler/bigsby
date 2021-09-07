import { decode, JwtPayload, verify } from "jsonwebtoken";
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
import { JwksKeySet } from "../../../domain/models/jwksKey";
import { BigsbyError } from "../../../domain/errors/bigsbyError";
import { EntitlementsError } from "../../../domain/errors/entitlementsError";
import got, { HTTPError } from "got";
import jwkToPem, { RSA } from "jwk-to-pem";
import {
  createAuthorizerResult,
  extractAuthContext,
  generatePolicyStatements,
  parseMethodArn,
} from "../utils";
import { JwksAuthorizerConfig } from "./types";

export default class JwksAuthorizer implements LambdaAuthorizer {
  private readonly logger?: LambdaLogger;

  private keys: JwksKeySet | undefined;

  constructor(private config: JwksAuthorizerConfig) {
    this.keys = undefined;
    if (config.logger) {
      this.logger = resolve(config.logger);
    }
  }

  public async authorize(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>
  ): Promise<APIGatewayAuthorizerResult | void> {
    try {
      const { statements, principalIdFieldName, verifyDecoded } = this.config;

      const decoded = await this.verifyAndExtractJwtPayload(
        context,
        this.config
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
    }
  }

  private async getJwksKeys(): Promise<JwksKeySet> {
    if (!this.keys) {
      this.keys = await this.fetchKeysFromIssuer();
    }

    return this.keys;
  }

  private async verifyAndExtractJwtPayload(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>,
    config: JwksAuthorizerConfig
  ): Promise<JwtPayload | string> {
    const jwtPayload = decode(context.event.authorizationToken, {
      complete: true,
    });

    if (!jwtPayload) {
      throw new BigsbyError("JwtPayload is undefined after decoding.");
    }

    const key = (await this.getJwksKeys()).keys.find(
      (key) => key.kid === jwtPayload.header.kid
    );

    if (!key) {
      throw new EntitlementsError(
        `Key ID ${jwtPayload.header.kid} is not hosted by issuer.`
      );
    }

    return verify(
      context.event.authorizationToken,
      jwkToPem(key as RSA),
      config.verifyOptions
    );
  }

  private async fetchKeysFromIssuer(): Promise<JwksKeySet> {
    const issuerUrl = this.config.issuerUrl;

    const jwksUrl = `${issuerUrl}/.well-known/jwks.json`;
    this.logger?.info(jwksUrl);

    try {
      const { body: payload } = await got<JwksKeySet>(jwksUrl, {
        method: "GET",
        responseType: "json",
      });

      if ("keys" in payload) {
        return payload;
      } else {
        throw new BigsbyError(
          `Object returned from issuerUrl ${issuerUrl} doesn't contain 'keys'.`
        );
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        throw new BigsbyError(
          `The issuerUrl ${issuerUrl} returned error ${error.response.statusCode}: ${error.response.statusMessage}.`
        );
      } else {
        throw error;
      }
    }
  }
}
