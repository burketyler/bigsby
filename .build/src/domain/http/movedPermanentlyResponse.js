"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovedPermanentlyResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class MovedPermanentlyResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 301, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.MovedPermanentlyResponse = MovedPermanentlyResponse;
