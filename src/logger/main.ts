/* eslint-disable no-console, @typescript-eslint/no-explicit-any, @typescript-eslint/default-param-last */

import Pino, { Logger as PinoLogger, LogFn, stdSerializers } from "pino";

import { getConfig } from "../utils";

import { bindings } from "./utils";

export class Logger {
  public debug: LogFn;

  public info: LogFn;

  public warn: LogFn;

  public error: LogFn;

  public fatal: LogFn;

  private readonly pino: PinoLogger;

  constructor() {
    this.pino = Pino({
      serializers: {
        error: stdSerializers.err,
      },
      formatters: {
        bindings,
      },
      ...getConfig().logger,
    });

    this.debug = this.pino.debug.bind(this.pino);
    this.info = this.pino.info.bind(this.pino);
    this.warn = this.pino.warn.bind(this.pino);
    this.error = this.pino.error.bind(this.pino);
    this.fatal = this.pino.fatal.bind(this.pino);
  }
}
