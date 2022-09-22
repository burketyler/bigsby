import { LogLevel } from "ts-injection";

import { INVOKE_METHOD_NAME } from "../constants";
import { internalError } from "../response";
import { ApiHandler, BigsbyConfig } from "../types";
import { freezeDeep } from "../utils";

export const DEFAULT_CONFIG: BigsbyConfig = freezeDeep({
  logging: {
    enabled: true,
    level: LogLevel.INFO,
  },
  api: {
    request: {
      enableTypeCoercion: true,
    },
    response: {
      enableInferContentType: true,
    },
  },
});

export const ERRORED_HANDLER_INSTANCE: ApiHandler = {
  [INVOKE_METHOD_NAME]: async () => internalError(),
};

export const TOKEN_REQ_CONTEXT = "REQ_CONTEXT";
