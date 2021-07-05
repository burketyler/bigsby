import { ApiGatewayLambdaResponse } from "./apiGatewayLambdaResponse";

export class Forbidden extends ApiGatewayLambdaResponse {
  constructor(
    body?: any,
    statusCode: number = 403,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded: boolean = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
