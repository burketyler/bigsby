"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayLambdaResponse = void 0;
class ApiGatewayLambdaResponse {
    constructor(body, statusCode, headers = {}, isBase64Encoded) {
        this.body = body;
        this.statusCode = statusCode;
        this.headers = headers;
        this.isBase64Encoded = isBase64Encoded;
    }
}
exports.ApiGatewayLambdaResponse = ApiGatewayLambdaResponse;
