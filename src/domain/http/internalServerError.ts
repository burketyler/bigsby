import { LambdaResponse } from "./lambdaResponse";

export class InternalServerError extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 500,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
