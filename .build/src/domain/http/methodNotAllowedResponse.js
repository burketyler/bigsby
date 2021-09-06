"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodNotAllowedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class MethodNotAllowedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 405, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.MethodNotAllowedResponse = MethodNotAllowedResponse;
