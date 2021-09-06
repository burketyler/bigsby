import { LambdaResponse } from "./lambdaResponse";

export class OkResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 201,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
