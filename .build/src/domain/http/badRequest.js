"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequest = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class BadRequest extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 400, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.BadRequest = BadRequest;
