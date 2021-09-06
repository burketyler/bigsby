import { LambdaResponse } from "./lambdaResponse";

export class AcceptedResponse extends LambdaResponse {
  constructor(
    body?: unknown,
    statusCode = 202,
    headers: {
      [key: string]: string;
    } = {},
    isBase64Encoded = false
  ) {
    super(body, statusCode, headers, isBase64Encoded);
  }
}
