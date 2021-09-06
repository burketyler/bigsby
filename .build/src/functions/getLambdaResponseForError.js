"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLambdaResponseForError = void 0;
const validationError_1 = require("../domain/errors/validationError");
const badRequest_1 = require("../domain/http/badRequest");
const entitlementsError_1 = require("../domain/errors/entitlementsError");
const forbidden_1 = require("../domain/http/forbidden");
const internalServerError_1 = require("../domain/http/internalServerError");
const getLogger_1 = require("./getLogger");
function getLambdaResponseForError(err, config) {
    const logger = getLogger_1.getLogger();
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
exports.getLambdaResponseForError = getLambdaResponseForError;
function processValidationErr(err, logger, config) {
    var _a, _b;
    logger === null || logger === void 0 ? void 0 : logger.error(`${err.name}: ${err.message}`);
    (_b = (_a = config === null || config === void 0 ? void 0 : config.hooks) === null || _a === void 0 ? void 0 : _a.onValidationErr) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    return new badRequest_1.BadRequest(JSON.stringify(err.data));
}
function processEntitlementsErr(err, logger, config) {
    var _a, _b;
    logger === null || logger === void 0 ? void 0 : logger.error(`${err.name}: ${err.message}`);
    (_b = (_a = config === null || config === void 0 ? void 0 : config.hooks) === null || _a === void 0 ? void 0 : _a.onEntitlementsErr) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    return new forbidden_1.Forbidden(JSON.stringify(err.data));
}
function processUnhandledErr(err, logger, config) {
    var _a, _b;
    logger === null || logger === void 0 ? void 0 : logger.error("Unhandled exception occurred:", err);
    (_b = (_a = config === null || config === void 0 ? void 0 : config.hooks) === null || _a === void 0 ? void 0 : _a.onUnhandledErr) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    return new internalServerError_1.InternalServerError();
}
