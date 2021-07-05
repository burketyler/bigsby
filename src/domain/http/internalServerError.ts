import { ApiGatewayLambdaResponse } from "./apiGatewayLambdaResponse";

export class InternalServerError extends ApiGatewayLambdaResponse {
  constructor(
    body?: any,
    statusCode: number = 500,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded: boolean = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
