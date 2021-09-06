"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialContentResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class PartialContentResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 206, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.PartialContentResponse = PartialContentResponse;
