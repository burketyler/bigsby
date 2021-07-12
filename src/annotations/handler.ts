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

const { injectionCtx } = useInjectionContext();

export function Handler<T extends Newable>(classCtor: T): void {
  const handler = initializeHandler(classCtor);
  Bigsby.getConfig().lambda?.hooks?.onHandlerInit?.(handler);
  wrapHandlerExecute(handler);
}

function wrapHandlerExecute(handler: LambdaHandler): void {
  const handlerFn: RawHandlerFn = handler.execute;
  handler.execute = async (
    event: APIGatewayProxyEvent,
    eventContext: APIGatewayEventRequestContext,
    config: LambdaConfig
  ) => {
    const context: LambdaExecutionContext = {
      event,
      context: eventContext,
      config: merge(Bigsby.getConfig().lambda, config),
    };
    context.config.hooks?.beforeExecute?.(context);
    return await applyExecuteTransforms(handler, handlerFn, context);
  };
}

function applyExecuteTransforms(
  handler: LambdaHandler,
  handlerFn: LambdaExecuteFn,
  context: LambdaExecutionContext
): Promise<LambdaResponse> {
  return handlerFn
    .apply(handler, [
      context,
      ...(getArgsForHandlerParams(context, handler) ?? []),
    ])
    .then((res) => {
      return context.config.response?.enableAutoContentType
        ? addInferredContentTypeBody(res)
        : res;
    })
    .then((res) => {
      return context.config.response?.enableAutoHeaders
        ? addSecurityHeaders(res, context)
        : res;
    })
    .then((res) => {
      return addAdditionalHeaders(res, context);
    })
    .then((res) => {
      context.config.hooks?.afterExecute?.(res);
      return res;
    })
    .catch((err) => {
      context.config.hooks?.onErr?.(err);
      const res = getLambdaResponseForError(err, context.config);
      return addSecurityHeaders(res, context);
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
