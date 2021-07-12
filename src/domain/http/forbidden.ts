import { LambdaResponse } from "./lambdaResponse";

export class Forbidden extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 403,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
