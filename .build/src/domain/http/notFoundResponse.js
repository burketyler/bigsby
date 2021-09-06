"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class NotFoundResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 404, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.NotFoundResponse = NotFoundResponse;
