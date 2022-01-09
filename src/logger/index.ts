import { Logger } from "./main";

export { LoggerConfig } from "./types";

let logger: Logger | undefined;

export function useLogger(): Logger {
  if (!logger) {
    logger = new Logger();
  }

  return logger;
}
