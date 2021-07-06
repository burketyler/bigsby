"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapWithErrorHandler = void 0;
const constants_1 = require("../domain/constants");
const validationError_1 = require("../domain/errors/validationError");
const badRequest_1 = require("../domain/http/badRequest");
const entitlementsError_1 = require("../domain/errors/entitlementsError");
const forbidden_1 = require("../domain/http/forbidden");
const internalServerError_1 = require("../domain/http/internalServerError");
const ts_injection_1 = require("ts-injection");
const { injectionCtx } = ts_injection_1.useInjectionContext();
function wrapWithErrorHandler(handler) {
    var _a;
    const logger = (_a = injectionCtx.queryByType(constants_1.InjectableType.LOGGER)) === null || _a === void 0 ? void 0 : _a[0];
    const handlerFn = handler.execute;
    handler.execute = async (config, ...args) => {
        try {
            return await handlerFn.apply(handler, [...args]);
        }
        catch (err) {
            if (err instanceof validationError_1.ValidationError) {
                return processValidationErr(err, logger, config);
            }
            else if (err instanceof entitlementsError_1.EntitlementsError) {
                return processEntitlementsErr(err, logger, config);
            }
            else {
                return processUnhandledErr(err, logger, config);
            }
        }
    };
}
exports.wrapWithErrorHandler = wrapWithErrorHandler;
function processValidationErr(err, logger, config) {
    var _a;
    logger === null || logger === void 0 ? void 0 : logger.error(`${err.name}: ${err.message}`);
    (_a = config === null || config === void 0 ? void 0 : config.onValidationErr) === null || _a === void 0 ? void 0 : _a.call(config, err);
    return new badRequest_1.BadRequest(JSON.stringify(err.data));
}
function processEntitlementsErr(err, logger, config) {
    var _a;
    logger === null || logger === void 0 ? void 0 : logger.error(`${err.name}: ${err.message}`);
    (_a = config === null || config === void 0 ? void 0 : config.onEntitlementsErr) === null || _a === void 0 ? void 0 : _a.call(config, err);
    return new forbidden_1.Forbidden(JSON.stringify(err.data));
}
function processUnhandledErr(err, logger, config) {
    var _a;
    logger === null || logger === void 0 ? void 0 : logger.error("Unhandled exception occurred:", err);
    (_a = config === null || config === void 0 ? void 0 : config.onUnhandledErr) === null || _a === void 0 ? void 0 : _a.call(config, err);
    return new internalServerError_1.InternalServerError();
}
