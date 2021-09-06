"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTimeoutResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class GatewayTimeoutResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 504, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.GatewayTimeoutResponse = GatewayTimeoutResponse;
