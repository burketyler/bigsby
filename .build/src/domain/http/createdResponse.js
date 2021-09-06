"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class CreatedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 201, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.CreatedResponse = CreatedResponse;
