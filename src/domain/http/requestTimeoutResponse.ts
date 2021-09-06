import { LambdaResponse } from "./lambdaResponse";

export class RequestTimeoutResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 408,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
