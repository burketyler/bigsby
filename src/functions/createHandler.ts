import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { ApiGatewayLambdaResponse } from "../domain/http/apiGatewayLambdaResponse";
import { register, resolve } from "ts-injection";
import { TKN_CONTEXT } from "../domain/constants";
import {
  LambdaHandler,
  LambdaHandlerConstructor,
} from "../domain/models/lambdaHandler";
import { LambdaHandlerConfig } from "../domain/models/lambdaHandlerConfig";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";

export function createHandler(
  app: LambdaHandlerConstructor,
  config: LambdaHandlerConfig = {}
) {
  return (
    event: APIGatewayProxyEvent,
    context: APIGatewayEventRequestContext
  ): Promise<ApiGatewayLambdaResponse> => {
    register<LambdaExecutionContext>(
      {
        event,
        context,
        config,
      },
      TKN_CONTEXT
    );
    return resolve<LambdaHandler>(app).execute(event, context, config);
  };
}
