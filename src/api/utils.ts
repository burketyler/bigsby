import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Context,
  Handler,
} from "aws-lambda";
import merge from "lodash.merge";
import { resolve, success, fail, Throwable } from "ts-injection";

import { BigsbyConfig, getConfig } from "../config";
import { INVOKE_METHOD_NAME } from "../constants";
import { useLogger } from "../logger";
import { badRequest } from "../response";
import {
  ApiVersionError,
  BigsbyError,
  ContentType,
  DeepPartial,
  InjectableMetaTag,
  RequestParseError,
} from "../types";
import { tryParseObject } from "../utils";
import {
  getApiVersion,
  getHandlerClassForVersion,
  isHandlerConstructor,
} from "../version";

import {
  HttpResponse,
  ApiHandlerConstructor,
  StandardizedEvent,
  HandlerClassesInput,
} from "./types";

const { logger } = useLogger();

export function createHandler(
  classes: HandlerClassesInput,
  handlerConfig?: DeepPartial<BigsbyConfig>
): Handler<APIGatewayProxyEvent, HttpResponse> {
  return async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<HttpResponse> => {
    let response: HttpResponse;
    let config: BigsbyConfig;

    config = mergeParamConfig(handlerConfig);

    if (config.logger.printRequest) {
      logger.info({ event, context }, "Received request.");
    }

    const getHandlerResult = getHandlerClass(classes, event, config);

    if (getHandlerResult.isError()) {
      if (getHandlerResult.value() instanceof BigsbyError) {
        throw getHandlerResult.value();
      }

      response = badRequest();
    } else {
      config = mergeAnnotationConfigs(getHandlerResult.value(), config);

      response = await resolve(getHandlerResult.value())[INVOKE_METHOD_NAME](
        event,
        context,
        config
      );
    }

    if (config.logger.printResponse) {
      logger.info({ response }, "Returning response.");
    }

    return response;
  };
}

function mergeParamConfig(
  handlerConfig: DeepPartial<BigsbyConfig> | undefined
): BigsbyConfig {
  const defaultConfig = getConfig();

  logger.debug(
    { defaultConfig, handlerConfig },
    "Merging defaultConfig <- handlerConfig."
  );

  return merge(defaultConfig, handlerConfig);
}

function getHandlerClass(
  classes: HandlerClassesInput,
  event: APIGatewayProxyEvent,
  { api: { versioning } }: BigsbyConfig
): Throwable<BigsbyError | ApiVersionError, ApiHandlerConstructor> {
  if (!versioning) {
    if (isHandlerConstructor(classes)) {
      return success(classes);
    }

    return fail(
      new BigsbyError(
        "Handler class array or map provided, but versioning not enabled for this API."
      )
    );
  }

  return getHandlerClassForVersion(getApiVersion(event, versioning), classes);
}

function mergeAnnotationConfigs(
  handlerClass: ApiHandlerConstructor,
  config: BigsbyConfig
): BigsbyConfig {
  const enrichedConfig = { ...config };
  const {
    api: { request, response },
  } = enrichedConfig;

  request.auth =
    config.api.request.auth ??
    Reflect.getOwnMetadata(InjectableMetaTag.AUTH_METHOD, handlerClass);

  request.schema =
    config.api.request.schema ??
    Reflect.getOwnMetadata(InjectableMetaTag.REQUEST_SCHEMA, handlerClass);

  response.schema =
    config.api.response.schema ??
    Reflect.getOwnMetadata(InjectableMetaTag.RESPONSE_SCHEMA, handlerClass);

  return enrichedConfig;
}

export function standardizeEvent(
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2
): StandardizedEvent {
  const standardEvent = {
    ...event,
  } as StandardizedEvent;

  standardEvent.headers = Object.entries(event.headers).reduce(
    (headers, [headerName, headerValue]) => {
      delete headers[headerName]; // eslint-disable-line no-param-reassign
      return { ...headers, [headerName.toLowerCase()]: headerValue };
    },
    { ...standardEvent.headers }
  );

  if (event.headers["content-type"] === ContentType.APPLICATION_JSON) {
    standardEvent.body = tryParseObject(event.body)
      .onSuccess((value) => value)
      .onError(() => {
        throw new RequestParseError(
          "Content-Type is application/json but failed to parse event body."
        );
      })
      .output();
  }

  return standardEvent;
}
