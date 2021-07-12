import { LambdaResponse } from "../domain/http/lambdaResponse";
import { BigsbyHeaders } from "../domain/models/bigsbyHeaders";
import { LambdaConfig } from "../domain/models/bigsbyConfig";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { reduceObjectToHeaders } from "./reduceObjectToHeaders";

export function addSecurityHeaders(
  response: LambdaResponse,
  context: LambdaExecutionContext
): LambdaResponse {
  response.headers = mergeSecurityHeaders(context.config, response.headers);
  return response;
}

function mergeSecurityHeaders(
  config: LambdaConfig,
  headers: BigsbyHeaders
): BigsbyHeaders {
  return reduceObjectToHeaders(config.response?.headers?.security, headers);
}
