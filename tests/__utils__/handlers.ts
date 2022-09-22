// eslint-disable-next-line max-classes-per-file
import { constants } from "http2";
import Joi from "joi";

import { Api } from "../../src/api";
import { Authentication } from "../../src/authentication";
import { Bigsby } from "../../src/bigsby";
import { Body, Context, Header, Path, Query } from "../../src/parsing";
import { badRequest, ok, ResponseBuilder } from "../../src/response";
import { ApiHandler, ApiResponse, RequestContext } from "../../src/types";
import { RequestSchema, ResponseSchema } from "../../src/validation";
import { Version } from "../../src/version";

const { HTTP_STATUS_OK, HTTP_STATUS_BAD_REQUEST } = constants;

@Api()
export class InjectionHandler implements ApiHandler {
  public async invoke(@Body() bigsby: Bigsby): Promise<ApiResponse> {
    const ctx = bigsby.getCurrentRequestContext();

    const builder = new ResponseBuilder();

    if (!ctx) {
      builder.statusCode(500).body("getCurrentRequestContext failed.");
    }

    return builder.build();
  }
}

@Api()
export class SuccessHandler implements ApiHandler {
  public spyOnMeUnhandled(): void {}

  public async invoke(
    @Body() theBody: { value: string },
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
  ): Promise<ApiResponse> {
    this.spyOnMeUnhandled();

    return ok({
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
    });
  }
}

@Api()
export class DirectValueHandler implements ApiHandler {
  public async invoke(): Promise<string> {
    return "imNotAnApiResponse";
  }
}

@Api()
export class ValidationHandler implements ApiHandler {
  @RequestSchema({
    body: Joi.string().required().options({ allowUnknown: true }),
  })
  @ResponseSchema({
    [HTTP_STATUS_OK]: Joi.object({
      body: Joi.string().required(),
    }).options({ allowUnknown: true }),
  })
  @ResponseSchema(
    HTTP_STATUS_BAD_REQUEST,
    Joi.object({
      body: Joi.string().allow("").required(),
    }).options({ allowUnknown: true })
  )
  public async invoke(
    @Header("Host") host: string,
    @Header("Pragma") body: string
  ): Promise<ApiResponse> {
    if (host === "bad") {
      return badRequest();
    }

    return ok(body);
  }
}

@Api()
@Authentication(async (context) => {
  if (!context.event.body) {
    throw new Error();
  }
})
export class AuthHandler implements ApiHandler {
  public async invoke(): Promise<ApiResponse> {
    return ok();
  }
}

@Api()
@Authentication("MOCK_AUTH")
export class RegisteredAuthHandler implements ApiHandler {
  public async invoke(): Promise<ApiResponse> {
    return ok();
  }
}

@Api()
@Version("v1")
export class Version1Handler implements ApiHandler {
  public async invoke(@Context() ctx: RequestContext): Promise<ApiResponse> {
    return ok(ctx.apiVersion);
  }
}

@Api()
@Version("v2")
export class Version2Handler implements ApiHandler {
  public async invoke(@Context() ctx: RequestContext): Promise<ApiResponse> {
    return ok(ctx.apiVersion);
  }
}
