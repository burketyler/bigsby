import { LambdaResponse } from "./lambdaResponse";

export class ServiceUnavailableResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 503,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
