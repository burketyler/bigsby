import { BigsbyHeaders } from "../models/bigsbyHeaders";

export class LambdaResponse {
  constructor(
    public body: unknown,
    public statusCode: number,
    public headers: BigsbyHeaders = {},
    public isBase64Encoded: boolean
  ) {}
}
