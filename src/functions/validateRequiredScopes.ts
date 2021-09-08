import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { EntitlementsError } from "../domain/errors/entitlementsError";
import { BigsbyError } from "../domain/errors/bigsbyError";

export function validateRequiredScopes(
  executionContext: LambdaExecutionContext,
  requiredScopes: string[]
): void {
  if (requiredScopes.length === 0) {
    return;
  }

  let userScopes: string[];

  const extractScopes = executionContext.config.auth?.scopes?.extractScopes;

  if (extractScopes) {
    userScopes = extractScopes(executionContext);
  } else {
    userScopes = getUserScopes(executionContext);
  }

  validateMissingScopes(userScopes, requiredScopes);
}

function getUserScopes(executionContext: LambdaExecutionContext): string[] {
  const userScopes: string =
    executionContext.event.requestContext.authorizer?.jwt.scopes;

  if (!userScopes) {
    throw new BigsbyError(
      `Invalid user scopes: event.requestContext.authorizer.jwt.scopes is undefined or not of type string`
    );
  }

  return userScopes.split(" ");
}

function validateMissingScopes(
  userScopes: string[],
  requiredScopes: string[]
): void {
  const missingScopes = extractMissingScopes(userScopes, requiredScopes);

  if (missingScopes.length > 0) {
    throw new EntitlementsError(
      `User is missing the following required scopes: ${missingScopes}.`
    );
  }
}

function extractMissingScopes(
  userScopes: string[],
  requiredScopes: string[]
): string[] {
  return requiredScopes.reduce((missingScopes: string[], reqScope) => {
    if (!userScopes.some((usrScope) => usrScope === reqScope)) {
      missingScopes.push(reqScope);
    }

    return missingScopes;
  }, []);
}
