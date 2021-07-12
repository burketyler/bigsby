import { LambdaResponse } from "../http/lambdaResponse";

export interface LambdaHandlerConstructor {
  new (): LambdaHandler;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LambdaExecuteFn = (...args: any[]) => Promise<LambdaResponse>;

export interface LambdaHandler {
  execute: LambdaExecuteFn;
}
