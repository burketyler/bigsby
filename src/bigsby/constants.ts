import { LogLevel } from "ts-injection";

import { INVOKE_METHOD_NAME } from "../constants";
import { internalError } from "../response";
import { BigsbyConfig } from "../types";
import { freezeDeep } from "../utils";

export const defaultConfig: BigsbyConfig = freezeDeep({
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

export const ERRORED_HANDLER_INSTANCE = {
  [INVOKE_METHOD_NAME]: async () => internalError(),
};
