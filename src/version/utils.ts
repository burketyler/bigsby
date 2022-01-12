import { APIGatewayProxyEvent } from "aws-lambda";
import { success, fail, Throwable } from "ts-injection";

import { ApiHandlerConstructor } from "../api";
import { BigsbyConfig } from "../config";
import { useLogger } from "../logger";
import { ApiVersionError, InjectableMetaTag } from "../types";

const { logger } = useLogger();

export function getApiVersion(
  event: APIGatewayProxyEvent,
  {
    method,
    key,
    defaultVersion,
  }: NonNullable<BigsbyConfig["api"]["versioning"]>
): string {
  const eventKey = method === "HEADER" ? "headers" : "pathParameters";

  return (
    event[eventKey]?.[key] ??
    event[eventKey]?.[key.toLowerCase()] ??
    defaultVersion
  );
}

export function getHandlerClassForVersion(
  apiVersion: string,
  classes:
    | ApiHandlerConstructor
    | { [VersionId: string]: ApiHandlerConstructor }
    | ApiHandlerConstructor[]
): Throwable<ApiVersionError, ApiHandlerConstructor> {
  let handler: ApiHandlerConstructor | undefined;

  if (isHandlerConstructor(classes)) {
    handler =
      Reflect.getOwnMetadata(InjectableMetaTag.VERSION_ID, classes) ===
      apiVersion
        ? classes
        : undefined;
  }

  if (isVersionedHandlerMap(classes)) {
    handler = classes[apiVersion];
  }

  if (Array.isArray(classes)) {
    handler = classes.find(
      (constructor) =>
        Reflect.getOwnMetadata(InjectableMetaTag.VERSION_ID, constructor) ===
        apiVersion
    );
  }

  if (!handler) {
    logger.warn(`Api version ${apiVersion} has no associated handler.`);

    return fail(new ApiVersionError());
  }

  return success(handler);
}

export function isHandlerConstructor(
  classes:
    | ApiHandlerConstructor
    | { [VersionId: string]: ApiHandlerConstructor }
    | ApiHandlerConstructor[]
): classes is ApiHandlerConstructor {
  return typeof classes === "function";
}

function isVersionedHandlerMap(
  classes:
    | ApiHandlerConstructor
    | { [VersionId: string]: ApiHandlerConstructor }
    | ApiHandlerConstructor[]
): classes is { [VersionId: string]: ApiHandlerConstructor } {
  return Object.keys(classes).length > 0;
}
