"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSecurityHeaders = void 0;
const reduceObjectToHeaders_1 = require("./reduceObjectToHeaders");
function addSecurityHeaders(response, context) {
    response.headers = mergeSecurityHeaders(context.config, response.headers);
    return response;
}
exports.addSecurityHeaders = addSecurityHeaders;
function mergeSecurityHeaders(config, headers) {
    var _a, _b;
    return reduceObjectToHeaders_1.reduceObjectToHeaders((_b = (_a = config.response) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.security, headers);
}
