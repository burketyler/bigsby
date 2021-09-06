import { LambdaResponse } from "./lambdaResponse";

export class ConflictResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 409,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
