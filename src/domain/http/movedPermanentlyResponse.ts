import { LambdaResponse } from "./lambdaResponse";

export class MovedPermanentlyResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 301,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
