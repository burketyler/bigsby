import { APIGatewayProxyEvent, Context } from "aws-lambda";
import {
  fail,
  InjectionError,
  makeClassInjectable,
  success,
  Throwable,
} from "ts-injection";

import { INVOKE_METHOD_NAME } from "../../constants";
import { useLogger } from "../../logger";
import { badRequest, internalError, unauthorized } from "../../response";
import {
  AuthenticationError,
  BigsbyConfig,
  RequestInvalidError,
  RequestParseError,
  ResponseInvalidError,
  ResponseParseError,
} from "../../types";
import { onInit } from "../../utils";

import { ERRORED_HANDLER_INSTANCE } from "./constants";
import {
  HttpResponse,
  RawApiHandlerInvokeFunction,
  ApiHandlerContext,
  ApiHandler,
  ApiHandlerConstructor,
  ApiHandlerInvokeFunction,
} from "./types";
import {
  callHook,
  parseRequestParams,
  standardizeEvent,
  transformResponse,
} from "./utils";

const logger = useLogger();

export function RestApi<HandlerClass extends ApiHandlerConstructor>(
  classCtor: HandlerClass
): void {
  const handler = instantiateHandler(classCtor)
    .onSuccess((instance) => instance)
    .onError(() => ERRORED_HANDLER_INSTANCE)
    .output();

  (handler[INVOKE_METHOD_NAME] as RawApiHandlerInvokeFunction) =
    wrapInvokeMethod(handler);
}

function instantiateHandler(
  classCtor: ApiHandlerConstructor
): Throwable<InjectionError, ApiHandler> {
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
  handlerInstance: ApiHandler
): (
  event: APIGatewayProxyEvent,
  apiGwEventContext: Context,
  config: BigsbyConfig
) => Promise<HttpResponse> {
  logger.info("Wrapping handler invoke method with Bigsby logic.");
  const invoke = handlerInstance[INVOKE_METHOD_NAME];

  return async (
    event: APIGatewayProxyEvent,
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

      callHook("onError", bigsbyConfig.apiHandler.lifecycle?.onError, error);
      return internalError();
    }
  };
}

async function runRestApiLifecycle(
  handlerInstance: ApiHandler,
  invoke: ApiHandlerInvokeFunction,
  event: APIGatewayProxyEvent,
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
  const { lifecycle } = bigsbyConfig.apiHandler;
  const { apiHandler: config } = bigsbyConfig;

  // Init
  callHook("onInit", onInit);

  // Invoke
  callHook("preInvoke", lifecycle?.preInvoke, event, apiGwEventContext);

  const context: ApiHandlerContext = {
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
  { apiHandler: { lifecycle } }: BigsbyConfig
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

function authenticate(
  context: ApiHandlerContext
): Throwable<AuthenticationError, void> {
  logger.info("Auth method provided, authenticating request.");

  try {
    context.config.apiHandler.request.auth?.(context);

    return success(undefined);
  } catch (error) {
    logger.info(error, "Authentication failed.");

    return fail(new AuthenticationError(error));
  }
}

function validateRequest(
  event: APIGatewayProxyEvent,
  context: ApiHandlerContext
): Throwable<RequestInvalidError, void> {
  const { apiHandler } = context.config;

  logger.info("Request schema provided, validating request.");

  const result = apiHandler.request.schema?.validate({
    headers: event.headers,
    body: event.body,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  });

  if (result?.error) {
    logger.info(result.error, "Request is invalid.");

    return fail(new RequestInvalidError(result.error));
  }

  return success(undefined);
}

function validateResponse(
  response: HttpResponse,
  context: ApiHandlerContext
): Throwable<ResponseInvalidError, void> {
  const { apiHandler } = context.config;

  const schemaForCode = apiHandler.response.schema?.[response.statusCode];
  logger.info("Response schemaForCode provided, validating response.");

  const result = schemaForCode?.validate(response);

  if (result?.error) {
    logger.info(result.error, "Response is invalid.");

    return fail(new ResponseInvalidError(result.error));
  }

  return success(undefined);
}
