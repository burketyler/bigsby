"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInferredContentTypeBody = void 0;
const contentType_1 = require("../domain/enums/contentType");
function addInferredContentTypeBody(response) {
    const body = extractBodyIfFunction(response.body);
    const contentType = inferContentType(body);
    response.headers = addContentTypeHeader(contentType, response.headers);
    response.body = prepareResponseBody(contentType, body);
    return response;
}
exports.addInferredContentTypeBody = addInferredContentTypeBody;
function extractBodyIfFunction(body) {
    let loops = 0;
    let parsedBody = body;
    while (typeof parsedBody === "function" && loops < 20) {
        parsedBody = parsedBody();
        loops++;
    }
    return parsedBody;
}
function inferContentType(body) {
    switch (typeof body) {
        case "bigint":
        case "number":
        case "string":
            return contentType_1.ContentType.TEXT;
        case "boolean":
        case "object":
            return contentType_1.ContentType.JSON;
        case "function":
        case "undefined":
            return contentType_1.ContentType.NONE;
        case "symbol":
        default:
            throw new Error(`Invalid body type ${typeof body}, cannot infer content type.`);
    }
}
function addContentTypeHeader(contentType, headers) {
    switch (contentType) {
        case contentType_1.ContentType.JSON:
            headers["Content-Type"] = "application/json";
            return headers;
        case contentType_1.ContentType.TEXT:
            headers["Content-Type"] = "text/plain";
            return headers;
        case contentType_1.ContentType.NONE:
            return headers;
    }
}
function prepareResponseBody(contentType, body) {
    switch (contentType) {
        case contentType_1.ContentType.TEXT:
            return `${body}`;
        case contentType_1.ContentType.JSON:
            return JSON.stringify(body);
        case contentType_1.ContentType.NONE:
            return undefined;
    }
}
