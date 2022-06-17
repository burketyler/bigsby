export const CONTENT_TYPE_HEADER = "Content-Type";

export const statusCodeDetailsMap: {
  [statusCode: number]: { type: string; message: string };
} = {
  400: { type: "BAD_REQUEST", message: "Bad Request" },
  401: { type: "UNAUTHORIZED", message: "Unauthorized" },
  402: { type: "PAYMENT_REQUIRED", message: "Payment Required" },
  403: { type: "FORBIDDEN", message: "Forbidden" },
  404: { type: "NOT_FOUND", message: "Not Found" },
  405: { type: "METHOD_NOT_ALLOWED", message: "Method Not Allowed" },
  406: { type: "NOT_ACCEPTABLE", message: "Not Acceptable" },
  407: {
    type: "PROXY_AUTHENTICATION_REQUIRED",
    message: "Proxy Authentication Required",
  },
  408: { type: "REQUEST_TIMEOUT", message: "Request Timeout" },
  409: { type: "CONFLICT", message: "Conflict" },
  410: { type: "Gone", message: "Gone" },
  411: { type: "LENGTH_REQUIRED", message: "Length Required" },
  412: { type: "PRECONDITION_FAILED", message: "Precondition Failed" },
  413: { type: "REQUEST_TOO_LONG", message: "Request Entity Too Large" },
  414: { type: "REQUEST_URI_TOO_LONG", message: "Request-URI Too Long" },
  415: { type: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported Media Type" },
  416: {
    type: "REQUESTED_RANGE_NOT_SATISFIABLE",
    message: "Requested Range Not Satisfiable",
  },
  417: { type: "EXPECTATION_FAILED", message: "Expectation Failed" },
  418: { type: "IM_A_TEAPOT", message: "I'm a teapot" },
  419: {
    type: "INSUFFICIENT_SPACE_ON_RESOURCE",
    message: "Insufficient Space on Resource",
  },
  420: { type: "METHOD_FAILURE", message: "Method Failure" },
  421: { type: "MISDIRECTED_REQUEST", message: "Misdirected Request" },
  422: { type: "UNPROCESSABLE_ENTITY", message: "Unprocessable Entity" },
  423: { type: "LOCKED", message: "Locked" },
  424: { type: "FAILED_DEPENDENCY", message: "Failed Dependency" },
  428: { type: "PRECONDITION_REQUIRED", message: "Precondition Required" },
  429: { type: "TOO_MANY_REQUESTS", message: "Too Many Requests" },
  431: {
    type: "REQUEST_HEADER_FIELDS_TOO_LARGE",
    message: "Request Header Fields Too Large",
  },
  451: {
    type: "UNAVAILABLE_FOR_LEGAL_REASONS",
    message: "Unavailable For Legal Reasons",
  },
  500: { type: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" },
  501: { type: "NOT_IMPLEMENTED", message: "Not Implemented" },
  502: { type: "BAD_GATEWAY", message: "Bad Gateway" },
  503: { type: "SERVICE_UNAVAILABLE", message: "Service Unavailable" },
  504: { type: "GATEWAY_TIMEOUT", message: "Gateway Timeout" },
  505: {
    type: "HTTP_VERSION_NOT_SUPPORTED",
    message: "HTTP Version Not Supported",
  },
  507: { type: "INSUFFICIENT_STORAGE", message: "Insufficient Storage" },
  511: {
    type: "NETWORK_AUTHENTICATION_REQUIRED",
    message: "Network Authentication Required",
  },
};
