import { Schema } from "joi";

import {
  ApiHandlerConstructor,
  HttpResponse,
  RequestValidationSchema,
  ResponseValidationSchemaMap,
} from "../api";
import { InjectableMetaTag } from "../types";

export function RequestSchema<HandlerClass extends ApiHandlerConstructor>(
  schema: RequestValidationSchema
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(InjectableMetaTag.REQUEST_SCHEMA, schema, classCtor);
  };
}

export function ResponseSchemaMap<HandlerClass extends ApiHandlerConstructor>(
  schemaMap: ResponseValidationSchemaMap
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(
      InjectableMetaTag.RESPONSE_SCHEMA,
      schemaMap,
      classCtor
    );
  };
}

export function ResponseSchema<HandlerClass extends ApiHandlerConstructor>(
  statusCode: number,
  schema: Schema<HttpResponse>
) {
  return (classCtor: HandlerClass): void => {
    const schemaMap =
      Reflect.getOwnMetadata(InjectableMetaTag.RESPONSE_SCHEMA, classCtor) ??
      {};

    schemaMap[statusCode] = schema;

    Reflect.defineMetadata(
      InjectableMetaTag.RESPONSE_SCHEMA,
      schemaMap,
      classCtor
    );
  };
}
