"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdditionalHeaders = void 0;
const reduceObjectToHeaders_1 = require("./reduceObjectToHeaders");
function addAdditionalHeaders(response, context) {
    response.headers = addConfigHeaders(context.config, response.headers);
    response.headers = addRequestId(context.context, response.headers);
    return response;
}
exports.addAdditionalHeaders = addAdditionalHeaders;
function addConfigHeaders(config, headers) {
    var _a, _b;
    return reduceObjectToHeaders_1.reduceObjectToHeaders((_b = (_a = config.response) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.additional, headers);
}
function addRequestId(context, headers) {
    var _a;
    headers["X-AWS-Request-ID"] = ((_a = context["awsRequestId"]) !== null && _a !== void 0 ? _a : context.requestId);
    return headers;
}
