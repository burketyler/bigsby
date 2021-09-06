"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class UnauthorizedResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 401, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.UnauthorizedResponse = UnauthorizedResponse;
