"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class ServiceUnavailableResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 503, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.ServiceUnavailableResponse = ServiceUnavailableResponse;
