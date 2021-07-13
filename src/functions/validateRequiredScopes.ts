import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { EntitlementsError } from "../domain/errors/entitlementsError";
import { BigsbyError } from "../domain/errors/bigsbyError";

export function validateRequiredScopes(
  executionContext: LambdaExecutionContext,
  requiredScopes: string[]
): void {
  if (requiredScopes.length > 0) {
    const userScopes = executionContext.context?.authorizer?.scope;
    if (userScopes && typeof userScopes === "string") {
      const missingScopes = extractMissingScopes(userScopes, requiredScopes);
      if (missingScopes.length > 0) {
        throw new EntitlementsError(
          `User is missing the following required scopes: ${missingScopes}.`
        );
      }
    } else {
      throw new BigsbyError(
        "Invalid user scopes: context.authorizer.scope is undefined or not of type string"
      );
    }
  }
}

function extractMissingScopes(
  userScopeString: string,
  requiredScopes: string[]
): string[] {
  const userScopes = userScopeString.split(" ");
  return requiredScopes.reduce((missingScopes: string[], reqScope) => {
    if (!userScopes.some((usrScope) => usrScope === reqScope)) {
      missingScopes.push(reqScope);
    }
    return missingScopes;
  }, []);
}
