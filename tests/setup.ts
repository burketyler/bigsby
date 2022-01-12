import { setConfig } from "../src/config";

setConfig({
  logger: {
    level: "silent",
    transport: {
      target: "pino-pretty",
    },
  },
});
