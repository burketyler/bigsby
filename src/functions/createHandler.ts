import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { LambdaResponse } from "../domain/http/lambdaResponse";
import { register, resolve } from "ts-injection";
import { TKN_CONTEXT } from "../domain/constants";
import {
  LambdaHandler,
  LambdaHandlerConstructor,
} from "../domain/models/lambdaHandler";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { LambdaConfig } from "../domain/models/bigsbyConfig";

export function createHandler(
  app: LambdaHandlerConstructor,
  config: LambdaConfig = {}
) {
  return (
    event: APIGatewayProxyEvent,
    context: APIGatewayEventRequestContext
  ): Promise<LambdaResponse> => {
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
