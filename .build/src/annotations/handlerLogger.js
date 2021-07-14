"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerLogger = void 0;
const ts_injection_1 = require("ts-injection");
const injectableType_1 = require("../domain/enums/injectableType");
const { injectionCtx } = ts_injection_1.useInjectionContext();
function HandlerLogger(classCtor) {
    const token = ts_injection_1.makeClassInjectable(classCtor);
    if (!token) {
        throw new Error("Unable to initialize Logger class, check Injectable logger.");
    }
    injectionCtx.addMetadataToItem(token, {
        [ts_injection_1.META_TYPE]: injectableType_1.InjectableType.LOGGER,
    });
}
exports.HandlerLogger = HandlerLogger;
