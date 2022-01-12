// eslint-disable-next-line max-classes-per-file
import { constants } from "http2";
import Joi from "joi";

import { HttpResponse, Api, ApiHandler } from "../../src/api";
import { Auth } from "../../src/auth";
import { Body, Header, Path, Query } from "../../src/mapping";
import { badRequest, okResponse } from "../../src/response";
import {
  RequestSchema,
  ResponseSchema,
  ResponseSchemaMap,
} from "../../src/validation";
import { Version } from "../../src/version";

const { HTTP_STATUS_OK, HTTP_STATUS_BAD_REQUEST } = constants;

@Api
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

@Api
@RequestSchema({
  body: Joi.string().required().options({ allowUnknown: true }),
})
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

@Api
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

@Api
@Version("v1")
export class Version1Handler implements ApiHandler {
  public async invoke(): Promise<HttpResponse> {
    return okResponse({
      body: "v1",
    });
  }
}

@Api
@Version("v2")
export class Version2Handler implements ApiHandler {
  public async invoke(): Promise<HttpResponse> {
    return okResponse({
      body: "v2",
    });
  }
}
