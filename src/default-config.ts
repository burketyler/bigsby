import { BigsbyConfig } from "./types";

export const defaultConfig: BigsbyConfig = {
  logger: {
    enabled: true,
    level: "debug",
    printRequest: false,
    printResponse: false,
  },
  apiHandler: {
    request: {
      enableTypeCoercion: true,
    },
    response: {
      enableInferContentType: true,
    },
    lifecycle: {},
  },
};
