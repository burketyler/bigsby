import { LambdaResponse } from "./lambdaResponse";

export class GatewayTimeoutResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 504,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
