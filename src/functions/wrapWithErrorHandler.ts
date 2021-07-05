import { LambdaHandler } from "../domain/models/lambdaHandler";
import { LambdaLogger } from "../domain/models/lambdaLogger";
import { InjectableType } from "../domain/constants";
import { ValidationError } from "../domain/errors/validationError";
import { BadRequest } from "../domain/http/badRequest";
import { EntitlementsError } from "../domain/errors/entitlementsError";
import { Forbidden } from "../domain/http/forbidden";
import { InternalServerError } from "../domain/http/internalServerError";
import { useInjectionContext } from "ts-injection";
import { LambdaHandlerConfig } from "../domain/models/lambdaHandlerConfig";
import { ApiGatewayLambdaResponse } from "../domain/http/apiGatewayLambdaResponse";

const { injectionCtx } = useInjectionContext();

export function wrapWithErrorHandler(handler: LambdaHandler): void {
  const logger: LambdaLogger = injectionCtx.queryByType(
    InjectableType.LOGGER
  )?.[0];
  const handlerFn: Function = handler.execute;
  handler.execute = async (config: LambdaHandlerConfig, ...args: any[]) => {
    try {
      return await handlerFn.apply(handler, [...args]);
    } catch (err) {
      if (err instanceof ValidationError) {
        return processValidationErr(err, logger, config);
      } else if (err instanceof EntitlementsError) {
        return processEntitlementsErr(err, logger, config);
      } else {
        return processUnhandledErr(err, logger, config);
      }
    }
  };
}

function processValidationErr(
  err: ValidationError,
  logger?: LambdaLogger,
  config?: LambdaHandlerConfig
): ApiGatewayLambdaResponse {
  logger?.error(`${err.name}: ${err.message}`);
  config?.onValidationErr?.(err);
  return new BadRequest(JSON.stringify(err.data));
}

function processEntitlementsErr(
  err: EntitlementsError,
  logger?: LambdaLogger,
  config?: LambdaHandlerConfig
): ApiGatewayLambdaResponse {
  logger?.error(`${err.name}: ${err.message}`);
  config?.onEntitlementsErr?.(err);
  return new Forbidden(JSON.stringify(err.data));
}

function processUnhandledErr(
  err: Error,
  logger?: LambdaLogger,
  config?: LambdaHandlerConfig
): ApiGatewayLambdaResponse {
  logger?.error("Unhandled exception occurred:", err);
  config?.onUnhandledErr?.(err);
  return new InternalServerError();
}
