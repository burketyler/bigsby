"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotModifiedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class NotModifiedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 304, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.NotModifiedResponse = NotModifiedResponse;
