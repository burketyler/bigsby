import { LambdaResponse } from "./lambdaResponse";

export class UnauthorizedResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 401,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
