/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Schema, ValidationError } from "joi";
import { fail, success, Throwable } from "ts-injection";

import {
  ApiResponse,
  InjectableMetadata,
  RequestContext,
  RequestInvalidError,
  RequestValidationSchema,
  ResponseInvalidError,
  ResponseValidationSchemaMap,
} from "../types";

export function ReqSchema(schema: RequestValidationSchema) {
  return RequestSchema(schema);
}

export function RequestSchema(schema: RequestValidationSchema) {
  return (target: any, _propKey: string, _descriptor: any): void => {
    Reflect.defineMetadata(
      InjectableMetadata.REQUEST_SCHEMA,
      schema,
      target.constructor
    );
  };
}

export function ResSchema(schemaMap: ResponseValidationSchemaMap): any;
export function ResSchema(statusCode: number, schema: Schema<ApiResponse>): any;
export function ResSchema(
  schemaMapOrStatusCode: number | ResponseValidationSchemaMap,
  schema?: Schema<ApiResponse>
) {
  return ResponseSchema(schemaMapOrStatusCode, schema);
}

export function ResponseSchema(schemaMap: ResponseValidationSchemaMap): any;
export function ResponseSchema(
  statusCode: number,
  schema: Schema<ApiResponse>
): any;
export function ResponseSchema(
  schemaMapOrStatusCode: number | ResponseValidationSchemaMap,
  schema?: Schema<ApiResponse>
): any;
export function ResponseSchema(
  schemaMapOrStatusCode: number | ResponseValidationSchemaMap,
  schema?: Schema<ApiResponse>
) {
  return (target: any, _propKey: string, _descriptor: any): void => {
    let schemaMap: ResponseValidationSchemaMap;

    if (typeof schemaMapOrStatusCode === "number" && schema) {
      schemaMap =
        Reflect.getOwnMetadata(
          InjectableMetadata.RESPONSE_SCHEMA,
          target.constructor
        ) ?? {};

      schemaMap[schemaMapOrStatusCode] = schema;
    } else {
      schemaMap = schemaMapOrStatusCode as ResponseValidationSchemaMap;
    }

    Reflect.defineMetadata(
      InjectableMetadata.RESPONSE_SCHEMA,
      schemaMap,
      target.constructor
    );
  };
}

export function validateRequest(
  context: RequestContext
): Throwable<RequestInvalidError, void> {
  const { logger } = context.bigsby;
  const { schema } = context.config.request;
  const { body, headers, pathParameters, queryStringParameters } =
    context.event;

  let error: ValidationError | undefined;
  let errorSchema = "";

  logger.debug("Request schema provided, validating request.");

  if (schema?.body && body) {
    ({ error } = schema.body.validate(body));
    if (error) {
      errorSchema = "Request body";
    }
  }

  if (schema?.headers && headers) {
    ({ error } = schema.headers.validate(headers));
    if (error) {
      errorSchema = "Request headers";
    }
  }

  if (schema?.pathParameters && pathParameters) {
    ({ error } = schema.pathParameters.validate(pathParameters));
    if (error) {
      errorSchema = "Request pathParameters";
    }
  }

  if (schema?.queryStringParameters && queryStringParameters) {
    ({ error } = schema.queryStringParameters.validate(queryStringParameters));
    if (error) {
      errorSchema = "Request queryStringParameters";
    }
  }

  if (error) {
    logger.error(`${errorSchema} failed schema validation.`, { err: error });
    return fail(new RequestInvalidError(error));
  }

  return success(undefined);
}

export function validateResponse(
  response: ApiResponse,
  context: RequestContext
): Throwable<ResponseInvalidError, void> {
  const { config } = context;
  const { logger } = context.bigsby;

  const schemaForCode = config.response.schema?.[response.statusCode];

  logger.debug("Response schemaForCode provided, validating response.");

  const result = schemaForCode?.validate(response);

  if (result?.error) {
    logger.error("Response failed schema validation.", { error: result.error });

    return fail(new ResponseInvalidError(result.error));
  }

  return success(undefined);
}
