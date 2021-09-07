import {
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerResultContext,
  APIGatewayTokenAuthorizerEvent,
  Statement,
} from "aws-lambda";
import { ParsedMethodArn } from "../../domain/models/parsedMethodArn";
import { EffectStatement } from "../../domain/models/effectStatement";
import { AuthorizerContext } from "../../domain/models/lambdaAuthorizer";
import { JwtPayload } from "jsonwebtoken";

export function extractAuthContext(
  payload: JwtPayload | string
): APIGatewayAuthorizerResultContext {
  if (typeof payload === "string") {
    return {
      payload,
    };
  } else {
    return Object.entries(payload).reduce(
      (requestAuthCtx: APIGatewayAuthorizerResultContext, [key, value]) => {
        if (isPrimitive(value)) {
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

function isPrimitive(value: unknown): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function parseMethodArn(
  context: AuthorizerContext<APIGatewayTokenAuthorizerEvent>
): ParsedMethodArn {
  const methodArn = context.event.methodArn;
  const [, , , region, acctId, apiGwId] = methodArn.split("/")[0].split(":");
  const [, stage] = methodArn.split(":")[5].split("/");
  return { region, acctId, apiGwId, stage };
}

export function generatePolicyStatements(
  parsed: ParsedMethodArn,
  statements: EffectStatement[] | undefined
): Statement[] {
  if (statements) {
    return statements.reduce((statements: Statement[], statement) => {
      statements.push({
        Action: "execute-api:Invoke",
        Effect: statement.effect,
        Resource: `arn:aws:execute-api:${parsed.region}:${parsed.acctId}:${
          parsed.apiGwId
        }/${statement.stage ?? parsed.stage}/${statement.method ?? "*"}/${
          removeSlash(statement.path) ?? "*"
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

function removeSlash(path: string | undefined): string | undefined {
  return path?.charAt(0) === "/" ? path.slice(1) : path;
}

export function createAuthorizerResult(
  policyStatements: Statement[],
  requestAuthCtx: APIGatewayAuthorizerResultContext,
  principalIdFieldName: string
): APIGatewayAuthorizerResult {
  return {
    principalId:
      requestAuthCtx?.[principalIdFieldName]?.toString() ?? "Not Provided",
    policyDocument: {
      Version: "2012-10-17",
      Statement: policyStatements,
    },
    context: requestAuthCtx,
  };
}
