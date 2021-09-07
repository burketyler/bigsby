import { LambdaLogger } from "../domain/models/lambdaLogger";
import { ValidationError } from "../domain/errors/validationError";
import { BadRequest } from "../domain/http/badRequest";
import { EntitlementsError } from "../domain/errors/entitlementsError";
import { Forbidden } from "../domain/http/forbidden";
import { InternalServerError } from "../domain/http/internalServerError";
import { LambdaResponse } from "../domain/http/lambdaResponse";
import { LambdaConfig } from "../domain/models/bigsbyConfig";
import { getLogger } from "./getLogger";

export function getLambdaResponseForError(
  err: Error,
  config?: LambdaConfig
): LambdaResponse {
  const logger = getLogger();

  if (err instanceof ValidationError) {
    return processValidationErr(err, logger, config);
  } else if (err instanceof EntitlementsError) {
    return processEntitlementsErr(err, logger, config);
  } else {
    return processUnhandledErr(err, logger, config);
  }
}

function processValidationErr(
  err: ValidationError,
  logger?: LambdaLogger,
  config?: LambdaConfig
): LambdaResponse {
  logger?.error(`${err.name}: ${err.message}`);

  config?.hooks?.onValidationErr?.(err);

  return new BadRequest(JSON.stringify(err.data));
}

function processEntitlementsErr(
  err: EntitlementsError,
  logger?: LambdaLogger,
  config?: LambdaConfig
): LambdaResponse {
  logger?.error(`${err.name}: ${err.message}`);

  config?.hooks?.onEntitlementsErr?.(err);

  return new Forbidden(JSON.stringify(err.data));
}

function processUnhandledErr(
  err: Error,
  logger?: LambdaLogger,
  config?: LambdaConfig
): LambdaResponse {
  logger?.error("Unhandled exception occurred:", err);

  config?.hooks?.onUnhandledErr?.(err);

  return new InternalServerError();
}
