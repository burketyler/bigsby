"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
require("reflect-metadata");
const ts_injection_1 = require("ts-injection");
const wrapWithErrorHandler_1 = require("../functions/wrapWithErrorHandler");
const enrichResponseHeaders_1 = require("../functions/enrichResponseHeaders");
const applyRequestParamMapping_1 = require("../functions/applyRequestParamMapping");
const { injectionCtx } = ts_injection_1.useInjectionContext();
function Handler(classCtor) {
    const handler = initializeHandler(classCtor);
    wrapWithErrorHandler_1.wrapWithErrorHandler(handler);
    applyRequestParamMapping_1.applyRequestParamMapping(handler);
    enrichResponseHeaders_1.enrichResponseHeaders(handler);
}
exports.Handler = Handler;
function initializeHandler(classCtor) {
    const token = ts_injection_1.makeClassInjectable(classCtor);
    if (!token) {
        throw new Error("Unable to initialize Handler class, check Injectable logger.");
    }
    else {
        return injectionCtx.findItemByToken(token).value;
    }
}
