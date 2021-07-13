import { JwtPayload, verify } from "jsonwebtoken";
import {
  AuthorizerContext,
  LambdaAuthorizer,
} from "../domain/models/lambdaAuthorizer";
import {
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerResultContext,
  APIGatewayTokenAuthorizerEvent,
  Statement,
} from "aws-lambda";
import { ParsedMethodArn } from "../domain/models/parsedMethodArn";
import { JwtAuthorizerConfig } from "../domain/models/jwtAuthorizerConfig";
import { Injectable, resolve } from "ts-injection";
import { LambdaLogger } from "../domain/models/lambdaLogger";

@Injectable
export class JwtAuthorizer implements LambdaAuthorizer {
  private logger?: LambdaLogger;

  constructor() {}

  public authorize(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>,
    config: JwtAuthorizerConfig
  ): APIGatewayAuthorizerResult | void {
    try {
      if (config.logger) {
        this.logger = config.logger
          ? resolve<LambdaLogger>(config.logger)
          : undefined;
      }
      const decoded = this.verifyAndExtractJwtPayload(context, config);
      config.verifyDecoded?.(decoded);
      const authContext = this.extractAuthContext(decoded);
      const methodArn = this.parseMethodArn(context);
      const policyStatements = this.generatePolicyStatements(methodArn, config);
      const result = this.createAuthorizerResult(
        policyStatements,
        authContext,
        config
      );
      this.logger?.info("User authorized successfully.", result);
      return result;
    } catch (err) {
      this.logger?.error("User authorization failed.", err);
      context.callback("Unauthorized");
      return;
    }
  }

  private verifyAndExtractJwtPayload(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>,
    config: JwtAuthorizerConfig
  ): JwtPayload | string {
    return verify(
      context.event.authorizationToken,
      config.secretOrPublicKey,
      config.verifyOptions
    );
  }

  private extractAuthContext(
    payload: JwtPayload | string
  ): APIGatewayAuthorizerResultContext {
    if (typeof payload === "string") {
      return {
        payload,
      };
    } else {
      return Object.entries(payload).reduce(
        (requestAuthCtx: APIGatewayAuthorizerResultContext, [key, value]) => {
          if (this.isPrimitive(value)) {
            requestAuthCtx[key] = value;
          } else if (Array.isArray(value)) {
            requestAuthCtx[key] = value.join(",");
          }
          return requestAuthCtx;
        },
        {}
      );
    }
  }

  private isPrimitive(value: unknown): boolean {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    );
  }

  private parseMethodArn(
    context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>
  ): ParsedMethodArn {
    const methodArn = context.event.methodArn;
    const regionAcctIdApiGwIdBlob = methodArn.split("/")[0].split(":");
    const stageMethodUriBlob = methodArn.split(":")[5].split("/");
    const region = regionAcctIdApiGwIdBlob[3];
    const acctId = regionAcctIdApiGwIdBlob[4];
    const apiGwId = regionAcctIdApiGwIdBlob[5];
    const stage = stageMethodUriBlob[1];
    return { region, acctId, apiGwId, stage };
  }

  private generatePolicyStatements(
    parsed: ParsedMethodArn,
    config: JwtAuthorizerConfig
  ): Statement[] {
    if (config.statements) {
      return config.statements.reduce((statements: Statement[], statement) => {
        statements.push({
          Action: "execute-api:Invoke",
          Effect: statement.effect,
          Resource: `arn:aws:execute-api:${parsed.region}:${parsed.acctId}:${
            parsed.apiGwId
          }/${statement.stage ?? parsed.stage}/${statement.method ?? "*"}/${
            this.removeSlash(statement.path) ?? "*"
          }`,
        });
        return statements;
      }, []);
    } else {
      return [
        {
          Action: "execute-api:Invoke",
          Effect: "allow",
          Resource: `arn:aws:execute-api:${parsed.region}:${parsed.acctId}:${parsed.apiGwId}/${parsed.stage}/*/*`,
        },
      ];
    }
  }

  private removeSlash(path: string | undefined): string | undefined {
    return path?.charAt(0) === "/" ? path.slice(1) : path;
  }

  private createAuthorizerResult(
    policyStatements: Statement[],
    requestAuthCtx: APIGatewayAuthorizerResultContext,
    config: JwtAuthorizerConfig
  ): APIGatewayAuthorizerResult {
    return {
      principalId:
        requestAuthCtx?.[config.principalIdFieldName]?.toString() ??
        "Not Provided",
      policyDocument: {
        Version: "2012-10-17",
        Statement: policyStatements,
      },
      context: requestAuthCtx,
    };
  }
}
