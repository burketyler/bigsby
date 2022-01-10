import { APIGatewayProxyEvent, Context } from "aws-lambda";
import {
  makeClassInjectable,
  success,
  fail,
  Throwable,
  InjectionError,
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
} from "../../types";
import { onInit } from "../../utils";

import { ERRORED_HANDLER_INSTANCE } from "./constants";
import {
  HttpResponse,
  RawRestApiInvokeFunction,
  RestApiConfig,
  RestApiContext,
  RestApiHandler,
  RestApiHandlerConstructor,
  RestApiInvokeFunction,
} from "./types";
import {
  callHook,
  parseRequestParams,
  enrichResponse,
  standardizeEvent,
} from "./utils";

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
      const httpResponse = (
        await runRestApiLifecycle(
          handlerInstance,
          invoke,
          event,
          apiGwEventContext,
          bigsbyConfig
        )
      )
        .onSuccess((res) => res)
        .onError((error) => convertErrorToResponse(error, bigsbyConfig))
        .output();

      return enrichResponse(httpResponse, bigsbyConfig);
    } catch (error) {
      logger.error(error, "An unhandled error occurred during invocation.");

      return internalError();
    }
  };
}

async function runRestApiLifecycle(
  handlerInstance: RestApiHandler,
  invoke: RestApiInvokeFunction,
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
  const { lifecycle } = bigsbyConfig.restApi;
  const { restApi: config } = bigsbyConfig;

  // Invoke
  callHook("preInvoke", lifecycle?.preInvoke, event, apiGwEventContext);

  const context: RestApiContext = {
    config: bigsbyConfig,
    event: standardizeEvent(event),
    context: apiGwEventContext,
  };

  // Authenticate
  callHook("preAuth", lifecycle?.preAuth, context);
  const authResult = authenticate(context);
  if (authResult.isError()) {
    return fail(authResult.value());
  }

  // Validate (Request)
  callHook("preValidate", lifecycle?.preValidate, context);
  const validateReqResult = validateRequest(event, config);
  if (validateReqResult.isError()) {
    return fail(validateReqResult.value());
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
  const validateResResult = validateResponse(response, config);
  if (validateResResult.isError()) {
    return fail(validateResResult.value());
  }

  // Respond
  callHook("preResponse", lifecycle?.preResponse, response, context);
  return success(
    enrichResponse(
      lifecycle?.preResponse?.(response, context) ?? response,
      bigsbyConfig
    )
  );
}

function convertErrorToResponse(
  error: Error,
  { restApi: { lifecycle } }: BigsbyConfig
): HttpResponse {
  if (error instanceof AuthenticationError) {
    const { userError } = error;
    callHook("onAuthFail", lifecycle?.onAuthFail, userError);
    return unauthorized();
  }

  if (error instanceof RequestParseError) {
    callHook("onRequestInvalid", lifecycle?.onRequestInvalid, error);
    return badRequest();
  }

  if (error instanceof RequestInvalidError) {
    const { validateErr } = error;
    callHook("onRequestInvalid", lifecycle?.onRequestInvalid, validateErr);
    return badRequest();
  }

  if (error instanceof ResponseInvalidError) {
    const { validateErr } = error;
    callHook("onResponseInvalid", lifecycle?.onResponseInvalid, validateErr);
    return internalError();
  }

  callHook("onError", lifecycle?.onError, error);
  return internalError();
}

function authenticate(
  context: RestApiContext
): Throwable<AuthenticationError, void> {
  if (context.config.restApi.request.auth) {
    logger.info("Auth method provided, authenticating request.");

    try {
      context.config.restApi.request.auth?.(context);
    } catch (error) {
      logger.info(error, "Authentication failed.");

      fail(new AuthenticationError(error));
    }
  }

  return success(undefined);
}

function validateRequest(
  event: APIGatewayProxyEvent,
  config: RestApiConfig
): Throwable<RequestInvalidError, void> {
  if (config.request.schema) {
    logger.info("Request schema provided, validating request.");

    const { error } = config.request.schema.validate({
      headers: event.headers,
      body: event.body,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    });

    if (error) {
      logger.info(error, "Request is invalid.");

      return fail(new RequestInvalidError(error));
    }
  }

  return success(undefined);
}

function validateResponse(
  response: HttpResponse,
  config: RestApiConfig
): Throwable<ResponseInvalidError, void> {
  if (config.response.schema) {
    const responseSchema = config.response.schema[response.statusCode];
    logger.info("Response schema provided, validating response.");

    const { error } = responseSchema.validate(response);

    if (error) {
      logger.info(error, "Response is invalid.");

      return fail(new ResponseInvalidError(error));
    }
  }

  return success(undefined);
}
