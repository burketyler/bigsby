import { Body, Header, Path, Query } from "../../src/annotations/mapping";
import {
  HttpResponse,
  RestApi,
  RestApiHandler,
} from "../../src/annotations/rest-api";
import { okResponse } from "../../src/response";

@RestApi
export class HandlerRestApi implements RestApiHandler {
  public spyOnMeUnhandled(): void {}

  public async invoke(
    @Body theBody: { value: string },
    @Query() strQuery: string,
    @Query("numQuery") numberQuery: number,
    @Query() boolQuery: boolean,
    @Query() objQuery: { value: string },
    @Header() host: string,
    @Header("Pragma") pragma: string,
    @Header("num-header") numHeader: number,
    @Header("bool-header") boolHeader: boolean,
    @Header("obj-header") objHeader: { value: string },
    @Path("strPath") stringPath: string,
    @Path() numPath: number,
    @Path() boolPath: boolean,
    @Path() objPath: { value: string }
  ): Promise<HttpResponse> {
    this.spyOnMeUnhandled();

    return okResponse({
      body: {
        theBody,
        strQuery,
        numberQuery,
        boolQuery,
        objQuery,
        host,
        pragma,
        numHeader,
        boolHeader,
        objHeader,
        stringPath,
        numPath,
        boolPath,
        objPath,
      },
    });
  }
}
