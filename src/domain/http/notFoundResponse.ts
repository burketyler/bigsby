import { LambdaResponse } from "./lambdaResponse";

export class NotFoundResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 404,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
