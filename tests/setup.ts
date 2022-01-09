import { setConfig } from "../src/utils";

setConfig({
  logger: {
    level: "silent",
    transport: {
      target: "pino-pretty",
    },
  },
});
