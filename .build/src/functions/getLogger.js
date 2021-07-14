"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const ts_injection_1 = require("ts-injection");
const injectableType_1 = require("../domain/enums/injectableType");
function getLogger() {
    var _a;
    const { injectionCtx } = ts_injection_1.useInjectionContext();
    return (_a = injectionCtx.queryByType(injectableType_1.InjectableType.LOGGER)) === null || _a === void 0 ? void 0 : _a[0];
}
exports.getLogger = getLogger;
