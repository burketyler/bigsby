import { LambdaResponse } from "./lambdaResponse";

export class NotImplementedResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 501,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
