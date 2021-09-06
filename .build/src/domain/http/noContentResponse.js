"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoContentResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class NoContentResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 204, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.NoContentResponse = NoContentResponse;
