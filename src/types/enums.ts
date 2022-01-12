export enum InjectableMetaTag {
  REQUEST_MAPPING = "meta:request-mapping",
  REQUEST_SCHEMA = "meta:request-schema",
  RESPONSE_SCHEMA = "meta:response-schema",
  AUTH_METHOD = "meta:auth-method",
  VERSION_ID = "meta:version-id",
}

export enum InjectableToken {
  LOGGER = "LOGGER",
}

export enum InjectableType {
  HANDLER_CLASS = "type:handler-class",
}

export enum InferredType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  OBJECT = "OBJECT",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
}

export enum ContentType {
  APPLICATION_JSON = "application/json",
  TEXT_PLAIN = "text/plain",
  NONE = "none",
}

export enum ParameterInstructionTarget {
  CONTEXT = "context",
  BODY = "body",
  PATH = "pathParameters",
  QUERY = "queryStringParameters",
  HEADER = "headers",
}
