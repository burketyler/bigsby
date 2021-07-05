import { ApiGatewayLambdaResponse } from "./apiGatewayLambdaResponse";

export class OkResponse extends ApiGatewayLambdaResponse {
  constructor(
    body?: any,
    statusCode: number = 200,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded: boolean = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
