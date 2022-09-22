export const CONTENT_TYPE_HEADER = "content-type";
export const REQUEST_ID_HEADER = "x-bigsby-request-id";

export const DEFAULT_RESPONSE_MAP: {
  [statusCode: number]: { code: string; message: string };
} = {
  400: { code: "BAD_REQUEST", message: "Bad Request" },
  401: { code: "UNAUTHORIZED", message: "Unauthorized" },
  402: { code: "PAYMENT_REQUIRED", message: "Payment Required" },
  403: { code: "FORBIDDEN", message: "Forbidden" },
  404: { code: "NOT_FOUND", message: "Not Found" },
  405: { code: "METHOD_NOT_ALLOWED", message: "Method Not Allowed" },
  406: { code: "NOT_ACCEPTABLE", message: "Not Acceptable" },
  407: {
    code: "PROXY_AUTHENTICATION_REQUIRED",
    message: "Proxy Authentication Required",
  },
  408: { code: "REQUEST_TIMEOUT", message: "Request Timeout" },
  409: { code: "CONFLICT", message: "Conflict" },
  410: { code: "GONE", message: "Gone" },
  411: { code: "LENGTH_REQUIRED", message: "Length Required" },
  412: { code: "PRECONDITION_FAILED", message: "Precondition Failed" },
  413: { code: "REQUEST_TOO_LONG", message: "Request Entity Too Large" },
  414: { code: "REQUEST_URI_TOO_LONG", message: "Request-URI Too Long" },
  415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported Media Type" },
  416: {
    code: "REQUESTED_RANGE_NOT_SATISFIABLE",
    message: "Requested Range Not Satisfiable",
  },
  417: { code: "EXPECTATION_FAILED", message: "Expectation Failed" },
  418: { code: "IM_A_TEAPOT", message: "I'm a teapot" },
  419: {
    code: "INSUFFICIENT_SPACE_ON_RESOURCE",
    message: "Insufficient Space on Resource",
  },
  420: { code: "METHOD_FAILURE", message: "Method Failure" },
  421: { code: "MISDIRECTED_REQUEST", message: "Misdirected Request" },
  422: { code: "UNPROCESSABLE_ENTITY", message: "Unprocessable Entity" },
  423: { code: "LOCKED", message: "Locked" },
  424: { code: "FAILED_DEPENDENCY", message: "Failed Dependency" },
  428: { code: "PRECONDITION_REQUIRED", message: "Precondition Required" },
  429: { code: "TOO_MANY_REQUESTS", message: "Too Many Requests" },
  431: {
    code: "REQUEST_HEADER_FIELDS_TOO_LARGE",
    message: "Request Header Fields Too Large",
  },
  451: {
    code: "UNAVAILABLE_FOR_LEGAL_REASONS",
    message: "Unavailable For Legal Reasons",
  },
  500: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" },
  501: { code: "NOT_IMPLEMENTED", message: "Not Implemented" },
  502: { code: "BAD_GATEWAY", message: "Bad Gateway" },
  503: { code: "SERVICE_UNAVAILABLE", message: "Service Unavailable" },
  504: { code: "GATEWAY_TIMEOUT", message: "Gateway Timeout" },
  505: {
    code: "HTTP_VERSION_NOT_SUPPORTED",
    message: "HTTP Version Not Supported",
  },
  507: { code: "INSUFFICIENT_STORAGE", message: "Insufficient Storage" },
  511: {
    code: "NETWORK_AUTHENTICATION_REQUIRED",
    message: "Network Authentication Required",
  },
};
