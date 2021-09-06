"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceObjectToHeaders = void 0;
function reduceObjectToHeaders(object = {}, existingHeaders = {}) {
    return Object.entries(object).reduce((newHeaders, [name, value]) => {
        newHeaders[name] = value;
        return newHeaders;
    }, existingHeaders);
}
exports.reduceObjectToHeaders = reduceObjectToHeaders;
