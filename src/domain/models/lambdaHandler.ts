import { ApiGatewayLambdaResponse } from "../http/apiGatewayLambdaResponse";

export interface LambdaHandlerConstructor {
  new (): LambdaHandler;
}

export type LambdaExecuteFn = (
  ...args: any[]
) => Promise<ApiGatewayLambdaResponse>;

export interface LambdaHandler {
  execute: LambdaExecuteFn;
}
