"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class InternalServerError extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 500, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.InternalServerError = InternalServerError;
