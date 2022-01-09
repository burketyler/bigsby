import { LoggerOptions } from "pino";

export interface LoggerConfig extends LoggerOptions {
  printRequest: boolean;
  printResponse: boolean;
}
