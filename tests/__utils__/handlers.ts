// eslint-disable-next-line max-classes-per-file
import { constants } from "http2";
import Joi from "joi";

import {
  HttpResponse,
  RestApi,
  ApiHandler,
} from "../../src/annotations/api-handler";
import { Auth } from "../../src/annotations/auth";
import { Body, Header, Path, Query } from "../../src/annotations/mapping";
import {
  RequestSchema,
  ResponseSchema,
  ResponseSchemaMap,
} from "../../src/annotations/validation";
import { badRequest, okResponse } from "../../src/response";

const { HTTP_STATUS_OK, HTTP_STATUS_BAD_REQUEST } = constants;

@RestApi
export class SuccessHandler implements ApiHandler {
  public spyOnMeUnhandled(): void {}

  public async invoke(
    @Body theBody: { value: string },
    @Query() strQuery: string,
    @Query("numQuery") numberQuery: number,
    @Query() boolQuery: boolean,
    @Query() objQuery: { value: string },
    @Query() arrQuery: number[],
    @Header() host: string,
    @Header("Pragma") pragma: string,
    @Header("num-header") numHeader: number,
    @Header("bool-header") boolHeader: boolean,
    @Header("obj-header") objHeader: { value: string },
    @Header("arr-header") arrHeader: number[],
    @Path("strPath") stringPath: string,
    @Path() numPath: number,
    @Path() boolPath: boolean,
    @Path() objPath: { value: string },
    @Path() arrPath: number[]
  ): Promise<HttpResponse> {
    this.spyOnMeUnhandled();

    return okResponse({
      body: {
        theBody,
        strQuery,
        numberQuery,
        boolQuery,
        objQuery,
        arrQuery,
        host,
        pragma,
        numHeader,
        boolHeader,
        objHeader,
        arrHeader,
        stringPath,
        numPath,
        boolPath,
        objPath,
        arrPath,
      },
    });
  }
}

@RestApi
@RequestSchema(
  Joi.object({
    body: Joi.string().required(),
  }).options({ allowUnknown: true })
)
@ResponseSchemaMap({
  [HTTP_STATUS_OK]: Joi.object({
    body: Joi.string().required(),
  }).options({ allowUnknown: true }),
})
@ResponseSchema(
  Joi.object({
    body: Joi.string().allow("").required(),
  }).options({ allowUnknown: true }),
  HTTP_STATUS_BAD_REQUEST
)
export class ValidationHandler implements ApiHandler {
  public async invoke(
    @Header("Host") host: string,
    @Header("Pragma") body: string
  ): Promise<HttpResponse> {
    if (host === "bad") {
      return badRequest();
    }

    return okResponse({ body });
  }
}

@RestApi
@Auth((context) => {
  if (!context.event.body) {
    throw new Error();
  }
})
export class AuthHandler implements ApiHandler {
  public async invoke(): Promise<HttpResponse> {
    return okResponse();
  }
}
