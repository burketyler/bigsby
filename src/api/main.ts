import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Context,
} from "aws-lambda";
import {
  fail,
  InjectionError,
  makeClassInjectable,
  success,
  Throwable,
} from "ts-injection";

import { authenticate } from "../auth";
import { BigsbyConfig } from "../config";
import { INVOKE_METHOD_NAME } from "../constants";
import { useLogger } from "../logger";
import { parseRequestParams } from "../mapping";
import {
  badRequest,
  internalError,
  unauthorized,
  transformResponse,
} from "../response";
import {
  AuthenticationError,
  RequestInvalidError,
  RequestParseError,
  ResponseInvalidError,
  ResponseParseError,
  InjectableType,
} from "../types";
import { onInit } from "../utils";
import { validateRequest, validateResponse } from "../validation";

import { ERRORED_HANDLER_INSTANCE } from "./constants";
import {
  HttpResponse,
  RawHandlerInvokeFunction,
  ApiContext,
  ApiHandler,
  ApiHandlerConstructor,
  ApiHandlerInvokeFunction,
} from "./types";
import { standardizeEvent } from "./utils";

const { logger } = useLogger();

export function Api<HandlerClass extends ApiHandlerConstructor>(
  classCtor: HandlerClass
): void {
  const handler = instantiateHandler(classCtor)
    .onSuccess((instance) => instance)
    .onError(() => ERRORED_HANDLER_INSTANCE)
    .output();

  (handler[INVOKE_METHOD_NAME] as RawHandlerInvokeFunction) =
    wrapInvokeMethod(handler);
}

function instantiateHandler(
  classCtor: ApiHandlerConstructor
): Throwable<InjectionError, ApiHandler> {
  logger.info({ class: classCtor.name }, "Instantiating RestApi handler.");
  const makeInjectableResult = makeClassInjectable(classCtor, {
    type: InjectableType.HANDLER_CLASS,
  });

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
  handlerInstance: ApiHandler
): (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  apiGwEventContext: Context,
  config: BigsbyConfig
) => Promise<HttpResponse> {
  logger.info("Wrapping handler invoke method with Bigsby logic.");
  const invoke = handlerInstance[INVOKE_METHOD_NAME];

  return async (
    event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
    apiGwEventContext: Context,
    bigsbyConfig: BigsbyConfig
  ): Promise<HttpResponse> => {
    try {
      return (
        await runRestApiLifecycle(
          handlerInstance,
          invoke,
          event,
          apiGwEventContext,
          bigsbyConfig
        )
      )
        .onSuccess((response) => response)
        .onError((error) => convertErrorToResponse(error, bigsbyConfig))
        .output();
    } catch (error) {
      logger.error(error, "An unhandled error occurred during invocation.");

      callHook("onError", bigsbyConfig.api.lifecycle?.onError, error);
      return internalError();
    }
  };
}

async function runRestApiLifecycle(
  handlerInstance: ApiHandler,
  invoke: ApiHandlerInvokeFunction,
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  apiGwEventContext: Context,
  bigsbyConfig: BigsbyConfig
): Promise<
  Throwable<
    | AuthenticationError
    | ResponseInvalidError
    | RequestInvalidError
    | RequestParseError,
    HttpResponse
  >
> {
  const { lifecycle } = bigsbyConfig.api;
  const { api: config } = bigsbyConfig;

  // Init
  callHook("onInit", onInit, bigsbyConfig);

  // Invoke
  callHook("preInvoke", lifecycle?.preInvoke, event, apiGwEventContext);

  const context: ApiContext = {
    config: bigsbyConfig,
    event: standardizeEvent(event),
    context: apiGwEventContext,
  };

  // Authenticate
  if (config.request.auth) {
    callHook("preAuth", lifecycle?.preAuth, context);
    const authResult = authenticate(context);
    if (authResult.isError()) {
      return fail(authResult.value());
    }
  }

  // Validate (Request)
  if (config.request.schema) {
    callHook("preValidate", lifecycle?.preValidate, context);
    const validateReqResult = validateRequest(event, context);
    if (validateReqResult.isError()) {
      return fail(validateReqResult.value());
    }
  }

  // Parse
  callHook("preParse", lifecycle?.preParse, context);
  const parseResult = parseRequestParams(handlerInstance, context);
  if (parseResult.isError()) {
    return fail(parseResult.value());
  }

  // Call Handler
  callHook("preExecute", lifecycle?.preExecute, context);
  logger.info("Calling handler invoke method.");
  const response = await invoke.call(handlerInstance, ...parseResult.value());

  // Validate (Response)
  if (config.response.schema) {
    const validateResResult = validateResponse(response, context);
    if (validateResResult.isError()) {
      return fail(validateResResult.value());
    }
  }

  // Respond
  const transformResult = transformResponse(
    callHook("preResponse", lifecycle?.preResponse, response, context) ??
      response,
    bigsbyConfig
  );
  if (transformResult.isError()) {
    return fail(transformResult.value());
  }

  return success(transformResult.value());
}

function convertErrorToResponse(
  error: Error,
  { api: { lifecycle } }: BigsbyConfig
): HttpResponse {
  if (error instanceof AuthenticationError) {
    const { userError } = error;
    callHook("onAuthFail", lifecycle?.onAuthFail, userError);
    callHook("onError", lifecycle?.onError, userError);
    return unauthorized();
  }

  if (
    error instanceof RequestInvalidError ||
    error instanceof RequestParseError
  ) {
    const errorToReport = (error as RequestInvalidError).validateErr ?? error;
    callHook("onRequestInvalid", lifecycle?.onRequestInvalid, errorToReport);
    callHook("onError", lifecycle?.onError, errorToReport);
    return badRequest();
  }

  if (
    error instanceof ResponseInvalidError ||
    error instanceof ResponseParseError
  ) {
    const errorToReport = (error as ResponseInvalidError).validateErr ?? error;
    callHook("onResponseInvalid", lifecycle?.onResponseInvalid, errorToReport);
    callHook("onError", lifecycle?.onError, errorToReport);
    return internalError();
  }

  callHook("onError", lifecycle?.onError, error);
  return internalError();
}

export function callHook<
  HookType extends (...argArr: any[]) => ReturnType<HookType> // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  name: string,
  hook: HookType | undefined,
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): ReturnType<HookType> {
  logger.debug(`Calling lifecycle hook ${name}.`);

  return hook?.(...args) as ReturnType<HookType>;
}
