import {
  ApiEvent,
  ApiHandlerConstructor,
  BigsbyConfig,
  HandlerClassesInput,
} from "../types";

export function getApiVersion(
  event: ApiEvent,
  config: NonNullable<BigsbyConfig["api"]["versioning"]>
): string {
  const { method, key, defaultVersion } = config;

  const eventKey = method === "HEADER" ? "headers" : "pathParameters";

  return (
    event[eventKey]?.[key] ??
    event[eventKey]?.[key.toLowerCase()] ??
    defaultVersion
  );
}

export function isVersionedHandlerMap(
  classes: HandlerClassesInput
): classes is { [VersionId: string]: ApiHandlerConstructor } {
  return Object.keys(classes).length > 0;
}
