export interface LambdaLogger {
  info(msg: string, ...args: any[]): void | any;
  debug(msg: string, ...args: any[]): void | any;
  error(msg: string, ...args: any[]): void | any;
}

export interface LambdaLoggerConstructor {
  new (): LambdaLogger;
}
