import { INVOKE_METHOD_NAME } from "../constants";
import { internalError } from "../response";
import { BigsbyConfig } from "../types";
import { freezeDeep } from "../utils";

export const defaultConfig: BigsbyConfig = freezeDeep({
  logger: {},
  api: {
    request: {
      enableTypeCoercion: true,
    },
    response: {
      enableInferContentType: true,
    },
  },
});

export const ERRORED_HANDLER_INSTANCE = {
  [INVOKE_METHOD_NAME]: async () => internalError(),
};

export const LOG_ENV_KEY = "BIGSBY_DEBUG";
