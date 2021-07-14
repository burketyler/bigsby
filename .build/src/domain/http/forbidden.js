"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forbidden = void 0;
const lambdaResponse_1 = require("./lambdaResponse");
class Forbidden extends lambdaResponse_1.LambdaResponse {
    constructor(body, statusCode = 403, headers = {}, isBase64Encoded = false) {
        super(body, statusCode, headers, isBase64Encoded);
    }
}
exports.Forbidden = Forbidden;
