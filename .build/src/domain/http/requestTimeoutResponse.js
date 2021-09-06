"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTimeoutResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class RequestTimeoutResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 408, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.RequestTimeoutResponse = RequestTimeoutResponse;
