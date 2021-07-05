export class ApiGatewayLambdaResponse {
  constructor(
    public body: any,
    public statusCode: number,
    public headers: {
      [key: string]: string;
    } = {},
    public isBase64Encoded: boolean
  ) {}
}
