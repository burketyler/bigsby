import { DynamoDB } from "aws-sdk";
import { ValidationError } from "../errors/validationError";
import { EntitlementsError } from "../errors/entitlementsError";
import { LambdaExecutionContext } from "./lambdaExecutionContext";
import { LambdaResponse } from "../http/lambdaResponse";
import { LambdaHandler } from "./lambdaHandler";

export interface BigsbyConfig {
  ddb?: DynamoConfig;
  lambda?: LambdaConfig;
}

export interface DynamoConfig {
  live?: DynamoDB.ClientConfiguration;
  local?: DynamoDB.ClientConfiguration;
  enableLocal?: boolean;
}

export interface LambdaConfig {
  error?: {
    enableAutoErrorHandling?: boolean;
  };
  request?: {
    enableInferType?: boolean;
    jsonParser?: (rawBody: string | null) => Record<string, unknown>;
  };
  response?: {
    enableAutoContentType?: boolean;
    enableAutoHeaders?: boolean;
    headers?: {
      security?: {
        "Access-Control-Allow-Origin"?: string | undefined;
        "Strict-Transport-Security"?: string;
        "Set-Cookie"?: string;
        "X-Content-Type-Options"?: string;
        "Cache-Control"?: string;
        "X-Frame-Options"?: string;
        "X-XSS-Protection"?: string;
      };
      additional?: {
        [key: string]: string;
      };
    };
  };
  hooks?: {
    onHandlerInit?: (handler: LambdaHandler) => LambdaHandler;
    beforeExecute?: (context: LambdaExecutionContext) => LambdaExecutionContext;
    afterExecute?: (response: LambdaResponse) => LambdaResponse;
    onErr?: (err: Error) => void;
    onUnhandledErr?: (err: Error) => void;
    onValidationErr?: (err: ValidationError) => void;
    onEntitlementsErr?: (err: EntitlementsError) => void;
  };
}
