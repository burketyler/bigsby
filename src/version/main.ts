import { fail, success, Throwable } from "ts-injection";

import {
  ApiEvent,
  ApiHandlerConstructor,
  BigsbyConfig,
  BigsbyLogger,
  ErrorCode,
  HandlerClassesInput,
  InjectableMetadata,
} from "../types";

import { getApiVersion, isVersionedHandlerMap } from "./utils";

export function V<HandlerClass extends ApiHandlerConstructor>(id: string) {
  return Version<HandlerClass>(id);
}

export function Version<HandlerClass extends ApiHandlerConstructor>(
  id: string
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(InjectableMetadata.VERSION_ID, id, classCtor);
  };
}

export function getHandlerClassForVersion(
  logger: BigsbyLogger,
  classes: HandlerClassesInput,
  event: ApiEvent,
  config: NonNullable<BigsbyConfig["api"]["versioning"]>
): Throwable<ErrorCode.HANDLER_VERSION_NOT_FOUND, ApiHandlerConstructor> {
  let handler: ApiHandlerConstructor | undefined;

  const apiVersion = getApiVersion(event, config);

  if (typeof classes === "function") {
    handler =
      Reflect.getOwnMetadata(InjectableMetadata.VERSION_ID, classes) ===
      getApiVersion(event, config)
        ? classes
        : undefined;
  }

  if (isVersionedHandlerMap(classes)) {
    handler = classes[apiVersion];
  }

  if (Array.isArray(classes)) {
    handler = classes.find(
      (constructor) =>
        Reflect.getOwnMetadata(InjectableMetadata.VERSION_ID, constructor) ===
        apiVersion
    );
  }

  if (!handler) {
    logger.warn(`Api version ${apiVersion} has no associated handler.`);

    return fail(ErrorCode.HANDLER_VERSION_NOT_FOUND);
  }

  return success(handler);
}
