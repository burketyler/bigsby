"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class TooManyRequestResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 429, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.TooManyRequestResponse = TooManyRequestResponse;
