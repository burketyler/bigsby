export const TKN_LOGGER = "TOKEN_LOGGER";
export const TKN_CONTEXT = "TOKEN_CONTEXT";
export const HandlerExecuteMethod = "execute";

export enum InjectableType {
  LOGGER = "LOGGER",
}

export const META_REQUEST_MAPPING = "meta:request-mapping";

export enum RequestMapTarget {
  CONTEXT,
  BODY,
  PATH,
  QUERY,
  HEADER,
}
