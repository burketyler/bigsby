"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequest = void 0;
const apiGatewayLambdaResponse_1 = require("./apiGatewayLambdaResponse");
class BadRequest extends apiGatewayLambdaResponse_1.ApiGatewayLambdaResponse {
    constructor(body, statusCode = 400, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.BadRequest = BadRequest;
