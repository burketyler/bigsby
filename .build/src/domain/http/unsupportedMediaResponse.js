"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMediaResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class UnsupportedMediaResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 415, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.UnsupportedMediaResponse = UnsupportedMediaResponse;
