"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class NotImplementedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 501, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.NotImplementedResponse = NotImplementedResponse;
