import { BigsbyConfig } from "./models/bigsbyConfig";

export const defaultConfig: BigsbyConfig = {
  ddb: {
    enableLocal: true,
    local: {
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_SECRET",
    },
  },
  lambda: {
    error: {
      enableAutoErrorHandling: true,
    },
    request: {
      enableInferType: true,
    },
    response: {
      enableAutoContentType: true,
      enableAutoHeaders: true,
      headers: {
        security: {
          "Strict-Transport-Security": "max-age=3600; includeSubDomains",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "nocache",
          "X-Frame-Options": "deny",
          "X-XSS-Protection": "1; mode=block",
        },
      },
    },
  },
};
