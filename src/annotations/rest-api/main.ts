import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import {
  makeClassInjectable,
  success,
  fail,
  Throwable,
  InjectionError,
} from "ts-injection";

import { INVOKE_METHOD_NAME } from "../../constants";
import { useLogger } from "../../logger";
import { badRequest, internalError } from "../../response";
import { BigsbyConfig, RequestInvalidError } from "../../types";
import { onInit } from "../../utils";

import { ERRORED_HANDLER_INSTANCE } from "./constants";
import {
  HttpResponse,
  RawRestApiInvokeFunction,
  RestApiContext,
  RestApiHandler,
  RestApiHandlerConstructor,
} from "./types";
import { mapInvokeMethodParams, transformResponse } from "./utils";

const logger = useLogger();

export function RestApi<HandlerClass extends RestApiHandlerConstructor>(
  classCtor: HandlerClass
): void {
  onInit();

  const handler = instantiateHandler(classCtor)
    .onSuccess((instance) => instance)
    .onError(() => ERRORED_HANDLER_INSTANCE)
    .output();

  (handler[INVOKE_METHOD_NAME] as RawRestApiInvokeFunction) =
    wrapInvokeMethod(handler);
}

function instantiateHandler(
  classCtor: RestApiHandlerConstructor
): Throwable<InjectionError, RestApiHandler> {
  logger.info({ class: classCtor.name }, "Instantiating RestApi handler.");
  const makeInjectableResult = makeClassInjectable(classCtor);

  if (makeInjectableResult.isSuccess()) {
    logger.debug("Handler class instantiated successfully.");
    return success(makeInjectableResult.value().instance);
  }

  logger.error(
    makeInjectableResult.value(),
    "Error instantiating handler class."
  );
  return fail(makeInjectableResult.value());
}

function wrapInvokeMethod(
  handlerInstance: RestApiHandler
): (
  event: APIGatewayProxyEvent,
  apiGwEventContext: APIGatewayEventRequestContext,
  config: BigsbyConfig
) => Promise<HttpResponse> {
  logger.info("Wrapping handler invoke method with Bigsby logic.");
  const invoke = handlerInstance[INVOKE_METHOD_NAME];

  return async (
    event: APIGatewayProxyEvent,
    apiGwEventContext: APIGatewayEventRequestContext,
    config: BigsbyConfig
  ): Promise<HttpResponse> => {
    const context: RestApiContext = {
      event,
      config,
      context: apiGwEventContext,
    };

    try {
      logger.debug("Calling onInvoke hook if defined.");
      context.config.restApi.lifecycle?.onInvoke?.(context);

      logger.debug("Calling preAuth hook if defined.");
      context.config.restApi.lifecycle?.preAuth?.(context);

      logger.debug("Calling preValidate hook if defined.");
      context.config.restApi.lifecycle?.preValidate?.(context);

      logger.debug("Calling preParse hook if defined.");
      context.config.restApi.lifecycle?.preParse?.(context);

      const parameters = mapInvokeMethodParams(handlerInstance, context);

      logger.debug("Calling preExecute hook if defined.");
      context.config.restApi.lifecycle?.preExecute?.(context);

      logger.info("Calling handler invoke method.");
      const response = await invoke.call(handlerInstance, ...parameters);

      logger.debug("Calling postExecute hook if defined.");
      context.config.restApi.lifecycle?.postExecute?.(response, context);

      return transformResponse(response, context);
    } catch (error) {
      logger.error(error, "Invoke method failed with error.");

      if (error instanceof RequestInvalidError) {
        logger.debug("Calling onRequestInvalid hook if defined.");
        context.config.restApi.lifecycle?.onRequestInvalid?.(error);
        return badRequest();
      }

      logger.debug("Calling onError hook if defined.");
      context.config.restApi.lifecycle?.onError?.(error);

      return internalError();
    }
  };
}
