"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forbidden = void 0;
const apiGatewayLambdaResponse_1 = require("./apiGatewayLambdaResponse");
class Forbidden extends apiGatewayLambdaResponse_1.ApiGatewayLambdaResponse {
    constructor(body, statusCode = 403, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.Forbidden = Forbidden;
