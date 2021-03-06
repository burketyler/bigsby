import cloneDeep from "clone-deep";
import mergeWith from "lodash.mergewith";
import { success, fail, Throwable, Logger } from "ts-injection";

import { authenticate } from "../authentication";
import { parseRequestParams } from "../parsing";
import {
  badRequest,
  forbidden,
  internalError,
  ResponseBuilder,
  transformResponse,
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
  logger: Logger,
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
  logger: Logger,
  classes: HandlerClassesInput,
  event: ApiEvent,
  config: ApiConfig
): Throwable<"NOT_FOUND" | BigsbyError, ApiHandlerConstructor> {
  if (!config.versioning) {
    if (typeof classes === "function") {
      return success(classes);
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
  const { config } = context;
  const { lifecycle } = config;
  const { logger } = context.bigsby;

  let response: ApiResponse | undefined;

  // Init
  logger.debug("Calling onInit.");
  await context.bigsby.onApiInit(config);

  // Invoke
  logger.debug("Calling preInvoke.");
  response = await resolveHookChain([lifecycle?.preInvoke], {
    context,
  });
  if (response) {
    return transformResponse(response, context);
  }

  // Authenticate
  if (config.request.auth) {
    logger.debug("Calling preAuth.");
    response = await resolveHookChain([lifecycle?.preAuth], {
      context,
    });
    if (response) {
      return transformResponse(response, context);
    }

    const authResult = await authenticate(context);
    if (authResult.isError()) {
      return fail(authResult.value());
    }
  }

  // Validate (Request)
  if (config.request.schema) {
    logger.debug("Calling preValidate.");
    response = await resolveHookChain([lifecycle?.preValidate], {
      context,
    });
    if (response) {
      return transformResponse(response, context);
    }

    const validateReqResult = validateRequest(context);
    if (validateReqResult.isError()) {
      return fail(validateReqResult.value());
    }
  }

  // Parse
  logger.debug("Calling preParse.");
  response = await resolveHookChain([lifecycle?.preParse], {
    context,
  });
  if (response) {
    return transformResponse(response, context);
  }

  const requestParams = parseRequestParams(handlerInstance, context);
  if (requestParams.isError()) {
    return fail(requestParams.value());
  }

  // Execute Handler
  logger.debug("Calling preExecute.");
  response = await resolveHookChain([lifecycle?.preExecute], {
    context,
  });
  if (response) {
    return transformResponse(response, context);
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
  response = await resolveHookChainDefault([lifecycle?.preResponse], response, {
    response,
    context,
  });

  return transformResponse(response, context);
}

export async function convertErrorToResponse(
  logger: Logger,
  error: Error,
  context: RequestContext
): Promise<ApiResponse> {
  const { lifecycle } = context.config;

  if (error instanceof AuthenticationError) {
    logger.debug("Calling onAuthFail.");
    return resolveHookChainDefault(
      [lifecycle?.onAuthFail],
      error.userError instanceof ForbiddenError ? forbidden() : unauthorized(),
      { error: error.userError, context }
    );
  }

  if (
    error instanceof RequestInvalidError ||
    error instanceof RequestParseError
  ) {
    logger.debug("Calling onRequestInvalid.");
    return resolveHookChainDefault(
      [lifecycle?.onRequestInvalid],
      badRequest(),
      {
        error: (error as RequestInvalidError).validateErr ?? error,
        context,
      }
    );
  }

  if (
    error instanceof ResponseInvalidError ||
    error instanceof ResponseParseError
  ) {
    logger.debug("Calling onResponseInvalid then onError.");
    return resolveHookChainDefault(
      [lifecycle?.onResponseInvalid, lifecycle?.onError],
      internalError(),
      { error: (error as RequestInvalidError).validateErr ?? error, context }
    );
  }

  logger.debug("Calling onError.");
  return resolveHookChainDefault([lifecycle?.onError], internalError(), {
    error,
    context,
  });
}
