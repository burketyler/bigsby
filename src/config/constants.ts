import { BigsbyConfig } from "./types";

export const defaultConfig: BigsbyConfig = {
  logger: {
    enabled: true,
    level: "warn",
    printRequest: false,
    printResponse: false,
  },
  api: {
    request: {
      enableTypeCoercion: true,
    },
    response: {
      enableInferContentType: true,
    },
  },
};
