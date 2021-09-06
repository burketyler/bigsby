"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class ConflictResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 409, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.ConflictResponse = ConflictResponse;
