import { LambdaResponse } from "./lambdaResponse";

export class NoContentResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 204,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
