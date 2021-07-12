import { LambdaResponse } from "./lambdaResponse";

export class BadRequest extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 400,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
