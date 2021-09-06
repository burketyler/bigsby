"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkResponse = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class OkResponse extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 200, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.OkResponse = OkResponse;
