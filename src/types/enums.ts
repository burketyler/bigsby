export enum ErrorCode {
  HANDLER_VERSION_NOT_FOUND,
}

export enum InjectableMetadata {
  REQUEST_MAPPING = "bigsby:request.mapping",
  REQUEST_SCHEMA = "bigsby:request.schema",
  RESPONSE_SCHEMA = "bigsby:response.schema",
  API_CONFIG = "bigsby:api.config",
  AUTH_METHOD = "bigsby:auth.method",
  VERSION_ID = "bigsby:version.id",
}

export enum InjectableTag {
  HANDLER = "BIGSBY_API_HANDLER",
}

export enum InferredType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  OBJECT = "OBJECT",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
}

export enum ParameterInstructionTarget {
  CONTEXT = "context",
  BODY = "body",
  PATH = "pathParameters",
  QUERY = "queryStringParameters",
  HEADER = "headers",
}

export enum EnvVar {
  BIGSBY_LOG = "BIGSBY_LOG",
}
