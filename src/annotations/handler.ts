import "reflect-metadata";
import {
  makeClassInjectable,
  Newable,
  useInjectionContext,
} from "ts-injection";
import { LambdaExecuteFn, LambdaHandler } from "../domain/models/lambdaHandler";
import { getLambdaResponseForError } from "../functions/getLambdaResponseForError";
import { addSecurityHeaders } from "../functions/addSecurityHeaders";
import { getArgsForHandlerParams } from "../functions/getArgsForHandlerParams";
import { addInferredContentTypeBody } from "../functions/addInferredContentTypeBody";
import { LambdaConfig } from "../domain/models/bigsbyConfig";
import { Bigsby } from "../classes/bigsby";
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import merge from "lodash.merge";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { LambdaResponse } from "../domain/http/lambdaResponse";
import { addAdditionalHeaders } from "../functions/addAdditionalHeaders";
import { RawHandlerFn } from "../domain/models/rawHandlerFn";
import { InternalServerError } from "../domain/http/internalServerError";
import { BigsbyError } from "../domain/errors/bigsbyError";
import { InjectableItemModel } from "ts-injection/.build/src/domain/model/injectableItem.model";
import { getLogger } from "../functions/getLogger";
import { META_SCOPES } from "../domain/constants";
import { validateRequiredScopes } from "../functions/validateRequiredScopes";

const { injectionCtx } = useInjectionContext();

export function Handler<T extends Newable>(classCtor: T): void {
  const handler = initializeHandler(classCtor);
  const mutatedHandler =
    Bigsby.getConfig().lambda?.hooks?.onHandlerInit?.(handler);
  wrapHandlerExecute(
    mutatedHandler ?? handler,
    getScopesFromHandlerClass(classCtor)
  );
}

function getScopesFromHandlerClass(classCtor: Newable): string[] {
  return Reflect.getOwnMetadata(META_SCOPES, classCtor) ?? [];
}

function wrapHandlerExecute(
  handler: LambdaHandler,
  requiredScopes: string[]
): void {
  const handlerFn: RawHandlerFn = handler.execute;
  handler.execute = async (
    event: APIGatewayProxyEvent,
    eventContext: APIGatewayEventRequestContext,
    config: LambdaConfig
  ) => {
    const executionContext: LambdaExecutionContext = {
      event,
      context: eventContext,
      config: merge(Bigsby.getConfig().lambda, config),
    };
    try {
      const mutatedExeCtx =
        executionContext.config.hooks?.beforeExecute?.(executionContext);
      validateRequiredScopes(mutatedExeCtx ?? executionContext, requiredScopes);
      return await applyExecuteTransforms(handler, handlerFn, executionContext);
    } catch (err) {
      executionContext.config.hooks?.onErr?.(err);
      const res = getLambdaResponseForError(err, executionContext.config);
      return addSecurityHeaders(res, executionContext);
    }
  };
}

function applyExecuteTransforms(
  handler: LambdaHandler,
  handlerFn: LambdaExecuteFn,
  executionContext: LambdaExecutionContext
): Promise<LambdaResponse> {
  return handlerFn
    .apply(handler, getArgsForHandlerParams(executionContext, handler) ?? [])
    .then((res) => {
      return executionContext.config.response?.enableAutoContentType
        ? addInferredContentTypeBody(res)
        : res;
    })
    .then((res) => {
      return executionContext.config.response?.enableAutoHeaders
        ? addSecurityHeaders(res, executionContext)
        : res;
    })
    .then((res) => {
      return addAdditionalHeaders(res, executionContext);
    })
    .then((res) => {
      const mutatedRes = executionContext.config.hooks?.afterExecute?.(res);
      return mutatedRes ?? res;
    });
}

function initializeHandler(classCtor: Newable): LambdaHandler {
  const logger = getLogger();
  try {
    return getHandlerFromInjectionContext(makeClassInjectable(classCtor));
  } catch (error) {
    logger?.error("Unable to initialize handler class.", error);
    return {
      execute: async () => {
        return new InternalServerError();
      },
    };
  }
}

function getHandlerFromInjectionContext(token?: string): LambdaHandler {
  let item: InjectableItemModel<LambdaHandler> | undefined;
  if (token) {
    item = injectionCtx.findItemByToken(token);
    if (item) {
      return item.value;
    }
  }
  throw new BigsbyError("Can't get handler from injection context.");
}
