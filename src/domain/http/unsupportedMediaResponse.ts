import { LambdaResponse } from "./lambdaResponse";

export class UnsupportedMediaResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 415,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
