"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const apiGatewayLambdaResponse_1 = require("./apiGatewayLambdaResponse");
class InternalServerError extends apiGatewayLambdaResponse_1.ApiGatewayLambdaResponse {
    constructor(body, statusCode = 500, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.InternalServerError = InternalServerError;
