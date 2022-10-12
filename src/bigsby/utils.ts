import cloneDeep from "clone-deep";
import mergeWith from "lodash.mergewith";
import { success, fail, Throwable } from "ts-injection";

import { authenticate } from "../authentication";
import { parseRequestParams } from "../parsing";
import {
  badRequest,
  forbidden,
  internalError,
  ResponseBuilder,
  unauthorized,
} from "../response";
import {
  ApiEvent,
  ApiHandler,
  ApiHandlerConstructor,
  ApiHandlerInvokeFunction,
  ApiResponse,
  AuthenticationError,
  BigsbyError,
  DeepPartial,
  ForbiddenError,
  HandlerClassesInput,
  InjectableMetadata,
  LifecycleErrors,
  RequestContext,
  RequestInvalidError,
  RequestParseError,
  ResponseInvalidError,
  ResponseParseError,
  ApiConfig,
  BigsbyLogger,
  InvalidApiVersionError,
  BigsbyPlugin,
} from "../types";
import {
  resolveHookChain,
  isApiResponse,
  resolveHookChainDefault,
} from "../utils";
import { validateRequest, validateResponse } from "../validation";
import { getHandlerClassForVersion } from "../version";

let instanceCursor = 0;

export function generateInstanceName(): string {
  if (instanceCursor === 0) {
    return "bigsby";
  }

  instanceCursor += 1;
  return `bigsby[${instanceCursor}]`;
}

export function concatArray(
  objValue: unknown,
  srcValue: unknown
): unknown[] | undefined {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }

  return undefined;
}

export function mergeParamConfigs(
  logger: BigsbyLogger,
  config: ApiConfig,
  scopedConfig: DeepPartial<ApiConfig> | undefined
): ApiConfig {
  const globalConfig = cloneDeep(config);

  logger.debug("Merging globalConfig <- scopedConfig.", {
    globalConfig,
    scopedConfig,
  });

  return mergeWith(globalConfig, scopedConfig, concatArray);
}

export function getHandlerClass(
  logger: BigsbyLogger,
  classes: HandlerClassesInput,
  event: ApiEvent,
  config: ApiConfig
): Throwable<
  InvalidApiVersionError | BigsbyError,
  { handler: ApiHandlerConstructor; apiVersion: string }
> {
  if (!config.versioning) {
    if (typeof classes === "function") {
      return success({ handler: classes, apiVersion: "" });
    }

    return fail(
      new BigsbyError(
        "Handler class array or map provided, but versioning not enabled for this API."
      )
    );
  }

  return getHandlerClassForVersion(logger, classes, event, config.versioning);
}

export function mergeAnnotationConfigs(
  handlerClass: ApiHandlerConstructor,
  config: ApiConfig
): ApiConfig {
  const newConfig = mergeWith(
    config,
    Reflect.getOwnMetadata(InjectableMetadata.API_CONFIG, handlerClass),
    concatArray
  );

  newConfig.request.auth =
    config.request.auth ??
    Reflect.getOwnMetadata(InjectableMetadata.AUTH_METHOD, handlerClass);

  newConfig.request.schema =
    config.request.schema ??
    Reflect.getOwnMetadata(InjectableMetadata.REQUEST_SCHEMA, handlerClass);

  newConfig.response.schema =
    config.response.schema ??
    Reflect.getOwnMetadata(InjectableMetadata.RESPONSE_SCHEMA, handlerClass);

  return newConfig;
}

export async function runRestApiLifecycle(
  handlerInstance: ApiHandler,
  invoke: ApiHandlerInvokeFunction,
  context: RequestContext
): Promise<Throwable<LifecycleErrors, ApiResponse>> {
  const { config, bigsby } = context;
  const { lifecycle } = config;
  const { logger } = bigsby;

  let response: ApiResponse | undefined;

  // Init
  logger.debug("Calling onInit.");
  await bigsby.invokeOnInitHook(config);

  // Invoke
  logger.debug("Calling preInvoke.");
  response = await resolveHookChain(
    {
      context,
    },
    lifecycle?.preInvoke
  );
  if (response) {
    return success(response);
  }

  // Authenticate
  if (config.request.auth) {
    logger.debug("Calling preAuth.");
    response = await resolveHookChain(
      {
        context,
      },
      lifecycle?.preAuth
    );
    if (response) {
      return success(response);
    }

    const authResult = await authenticate(context);
    if (authResult.isError()) {
      return fail(authResult.value());
    }
  }

  // Validate (Request)
  if (config.request.schema) {
    logger.debug("Calling preValidate.");
    response = await resolveHookChain(
      {
        context,
      },
      lifecycle?.preValidate
    );
    if (response) {
      return success(response);
    }

    const validateReqResult = validateRequest(context);
    if (validateReqResult.isError()) {
      return fail(validateReqResult.value());
    }
  }

  // Parse
  logger.debug("Calling preParse.");
  response = await resolveHookChain(
    {
      context,
    },
    lifecycle?.preParse
  );
  if (response) {
    return success(response);
  }

  const requestParams = parseRequestParams(handlerInstance, context);
  if (requestParams.isError()) {
    return fail(requestParams.value());
  }

  // Execute Handler
  logger.debug("Calling preExecute.");
  response = await resolveHookChain(
    {
      context,
    },
    lifecycle?.preExecute
  );
  if (response) {
    return success(response);
  }

  logger.debug("Calling handler invoke method.");
  response = await invoke.call(
    handlerInstance,
    ...requestParams.value(),
    logger
  );

  if (!isApiResponse(response)) {
    response = new ResponseBuilder(response).build();
  }

  // Validate (Response)
  if (config.response.schema) {
    const validateResResult = validateResponse(response, context);
    if (validateResResult.isError()) {
      return fail(validateResResult.value());
    }
  }

  // Respond
  logger.debug("Calling preResponse.");
  response = await resolveHookChainDefault(
    {
      handlerResponse: response,
      context,
    },
    response,
    lifecycle?.preResponse
  );

  return success(response);
}

export async function convertErrorToResponse(
  logger: BigsbyLogger,
  error: Error,
  context: RequestContext
): Promise<ApiResponse> {
  const { lifecycle } = context.config;

  if (error instanceof AuthenticationError) {
    logger.debug("Calling onAuthFail.");
    return resolveHookChainDefault(
      { error: error.userError, context },
      error.userError instanceof ForbiddenError ? forbidden() : unauthorized(),
      lifecycle?.onAuthFail
    );
  }

  if (isRequestError(error)) {
    logger.debug("Calling onRequestInvalid.");
    return resolveHookChainDefault(
      {
        error: (error as RequestInvalidError).validateErr ?? error,
        context,
      },
      badRequest(),
      lifecycle?.onRequestInvalid
    );
  }

  if (isResponseError(error)) {
    logger.debug("Calling onResponseInvalid then onError.");
    return resolveHookChainDefault(
      { error: (error as RequestInvalidError).validateErr ?? error, context },
      internalError(),
      lifecycle?.onResponseInvalid,
      lifecycle?.onError
    );
  }

  logger.debug("Calling onError.");
  return resolveHookChainDefault(
    {
      error,
      context,
    },
    internalError(),
    lifecycle?.onError
  );
}

function isRequestError(error: Error): boolean {
  return (
    error instanceof RequestInvalidError || error instanceof RequestParseError
  );
}

function isResponseError(error: Error): boolean {
  return (
    error instanceof ResponseInvalidError || error instanceof ResponseParseError
  );
}

export function isBigsbyPlugin(plugin: unknown): plugin is BigsbyPlugin {
  const castPlugin = plugin as BigsbyPlugin;

  return (
    !!castPlugin.name &&
    !!castPlugin.onRegister &&
    typeof castPlugin.onRegister === "function"
  );
}
