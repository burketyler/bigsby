"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkResponse = void 0;
const apiGatewayLambdaResponse_1 = require("./apiGatewayLambdaResponse");
class OkResponse extends apiGatewayLambdaResponse_1.ApiGatewayLambdaResponse {
    constructor(body, statusCode = 200, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.OkResponse = OkResponse;
