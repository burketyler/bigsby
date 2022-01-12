import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from "aws-lambda";
import { ValidationError } from "joi";
import { fail, success, Throwable } from "ts-injection";

import { ApiContext, HttpResponse } from "../api";
import { useLogger } from "../logger";
import { RequestInvalidError, ResponseInvalidError } from "../types";

const { logger } = useLogger();

export function validateRequest(
  {
    body,
    headers,
    pathParameters,
    queryStringParameters,
  }: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  context: ApiContext
): Throwable<RequestInvalidError, void> {
  const { schema } = context.config.api.request;
  let error: ValidationError | undefined;

  logger.debug("Request schema provided, validating request.");

  if (schema?.body) {
    error = schema.body.validate(body).error;
    logger.info(error, "Request body is invalid.");
  }

  if (schema?.headers) {
    error = schema.headers.validate(headers).error;
    logger.info(error, "Request headers are invalid.");
  }

  if (schema?.pathParameters) {
    error = schema.pathParameters.validate(pathParameters).error;
    logger.info(error, "Request pathParameters are invalid.");
  }

  if (schema?.queryStringParameters) {
    error = schema.queryStringParameters.validate(queryStringParameters).error;
    logger.info(error, "Request queryStringParameters are invalid.");
  }

  if (error) {
    return fail(new RequestInvalidError(error));
  }

  return success(undefined);
}

export function validateResponse(
  response: HttpResponse,
  context: ApiContext
): Throwable<ResponseInvalidError, void> {
  const { api } = context.config;

  const schemaForCode = api.response.schema?.[response.statusCode];
  logger.debug("Response schemaForCode provided, validating response.");

  const result = schemaForCode?.validate(response);

  if (result?.error) {
    logger.info(result.error, "Response is invalid.");

    return fail(new ResponseInvalidError(result.error));
  }

  return success(undefined);
}
