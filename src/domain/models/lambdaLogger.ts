// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogFn = (msg: string, ...args: any[]) => void | unknown;

export interface LambdaLogger {
  fatal: LogFn;
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
}

export interface LambdaLoggerConstructor {
  new (): LambdaLogger;
}
