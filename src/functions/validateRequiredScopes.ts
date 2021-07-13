import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { EntitlementsError } from "../domain/errors/entitlementsError";
import { BigsbyError } from "../domain/errors/bigsbyError";

export function validateRequiredScopes(
  executionContext: LambdaExecutionContext,
  requiredScopes: string[]
): void {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const scopesFieldName = executionContext.config.auth!.scopes!.fieldName!;
  const delimiter = executionContext.config.auth!.scopes!.delimiter!;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const userScopes =
    executionContext.config.auth?.scopes?.extractScopes?.(
      executionContext.context
    ) ?? getUserScopes(executionContext, scopesFieldName, delimiter);
  validateMissingScopes(userScopes, requiredScopes);
}

function getUserScopes(
  executionContext: LambdaExecutionContext,
  scopesFieldName: string,
  delimiter: string
): string[] {
  const userScopes: string =
    executionContext.context.authorizer?.[scopesFieldName];
  if (!userScopes) {
    throw new BigsbyError(
      `Invalid user scopes: context.authorizer.${scopesFieldName} is undefined or not of type string`
    );
  }
  return userScopes.split(delimiter);
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
