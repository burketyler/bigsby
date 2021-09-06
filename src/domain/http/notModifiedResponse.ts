import { LambdaResponse } from "./lambdaResponse";

export class NotModifiedResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 304,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}