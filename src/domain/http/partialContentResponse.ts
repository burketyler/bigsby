import { LambdaResponse } from "./lambdaResponse";

export class PartialContentResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 206,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
