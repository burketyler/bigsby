import { LambdaResponse } from "./lambdaResponse";

export class MethodNotAllowedResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 405,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
