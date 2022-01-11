import { Schema } from "joi";

import { META_REQUEST_SCHEMA, META_RESPONSE_SCHEMA } from "../../constants";
import {
  ApiHandlerConstructor,
  HttpResponse,
  RequestValidationSchema,
  ResponseValidationSchemaMap,
} from "../api-handler";

export function RequestSchema<HandlerClass extends ApiHandlerConstructor>(
  schema: RequestValidationSchema
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(META_REQUEST_SCHEMA, schema, classCtor);
  };
}

export function ResponseSchemaMap<HandlerClass extends ApiHandlerConstructor>(
  schemaMap: ResponseValidationSchemaMap
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(META_RESPONSE_SCHEMA, schemaMap, classCtor);
  };
}

export function ResponseSchema<HandlerClass extends ApiHandlerConstructor>(
  schema: Schema<HttpResponse>,
  statusCode: number
) {
  return (classCtor: HandlerClass): void => {
    const schemaMap =
      Reflect.getOwnMetadata(META_RESPONSE_SCHEMA, classCtor) ?? {};

    schemaMap[statusCode] = schema;

    Reflect.defineMetadata(META_RESPONSE_SCHEMA, schemaMap, classCtor);
  };
}
