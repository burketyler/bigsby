import { LambdaResponse } from "./lambdaResponse";

export class TooManyRequestResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 429,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
