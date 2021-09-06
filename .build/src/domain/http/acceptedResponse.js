"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class AcceptedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 202, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.AcceptedResponse = AcceptedResponse;
