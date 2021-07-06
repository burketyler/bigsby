"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichResponseHeaders = void 0;
function enrichResponseHeaders(handler) {
    const handlerFn = handler.execute;
    handler.execute = async (event, context, config) => {
        const response = await handlerFn.apply(handler, [
            event,
            context,
            config,
        ]);
        response.headers = evaluateHeaders(context, response.headers);
        return response;
    };
}
exports.enrichResponseHeaders = enrichResponseHeaders;
function evaluateHeaders(context, headers) {
    return Object.entries({
        "Access-Control-Allow-Origin": undefined,
        "Strict-Transport-Security": "max-age=3600; includeSubDomains",
        "Set-Cookie": "Secure; HttpOnly",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "nocache",
        "X-Frame-Options": "deny",
        "X-XSS-Protection": "1; mode=block",
        "X-AWS-Request-ID": getRequestId(context),
    }).reduce((newHeaders, [name, value]) => {
        const headerValue = determineHeader(name, value);
        if (headerValue) {
            headers[name] = headerValue;
        }
        return headers;
    }, headers);
}
function getRequestId(context) {
    var _a;
    return ((_a = context["awsRequestId"]) !== null && _a !== void 0 ? _a : context.requestId);
}
function determineHeader(headerName, defaultValue) {
    var _a, _b;
    const envName = headerName
        .split("-")
        .map((str) => str.toUpperCase())
        .join("_");
    return (_b = (_a = process.env[envName]) !== null && _a !== void 0 ? _a : defaultValue) !== null && _b !== void 0 ? _b : "";
}
