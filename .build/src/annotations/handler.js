"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const ts_injection_1 = require("ts-injection");
const getLambdaResponseForError_1 = require("../functions/getLambdaResponseForError");
const addSecurityHeaders_1 = require("../functions/addSecurityHeaders");
const getArgsForHandlerParams_1 = require("../functions/getArgsForHandlerParams");
const addInferredContentTypeBody_1 = require("../functions/addInferredContentTypeBody");
const bigsby_1 = require("../classes/bigsby");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
const addAdditionalHeaders_1 = require("../functions/addAdditionalHeaders");
const internalServerError_1 = require("../domain/http/internalServerError");
const bigsbyError_1 = require("../domain/errors/bigsbyError");
const getLogger_1 = require("../functions/getLogger");
const constants_1 = require("../domain/constants");
const validateRequiredScopes_1 = require("../functions/validateRequiredScopes");
const { injectionCtx } = ts_injection_1.useInjectionContext();
function Handler(classCtor) {
    var _a, _b, _c;
    const handler = initializeHandler(classCtor);
    const mutatedHandler = (_c = (_b = (_a = bigsby_1.Bigsby.getConfig().lambda) === null || _a === void 0 ? void 0 : _a.hooks) === null || _b === void 0 ? void 0 : _b.onHandlerInit) === null || _c === void 0 ? void 0 : _c.call(_b, handler);
    wrapHandlerExecute(mutatedHandler !== null && mutatedHandler !== void 0 ? mutatedHandler : handler, getScopesFromHandlerClass(classCtor));
}
exports.Handler = Handler;
function getScopesFromHandlerClass(classCtor) {
    var _a;
    return (_a = Reflect.getOwnMetadata(constants_1.META_SCOPES, classCtor)) !== null && _a !== void 0 ? _a : [];
}
function wrapHandlerExecute(handler, requiredScopes) {
    const handlerFn = handler.execute;
    handler.execute = async (event, eventContext, config) => {
        var _a, _b, _c, _d;
        const executionContext = {
            event,
            context: eventContext,
            config: lodash_merge_1.default(bigsby_1.Bigsby.getConfig().lambda, config),
        };
        try {
            const mutatedExeCtx = (_b = (_a = executionContext.config.hooks) === null || _a === void 0 ? void 0 : _a.beforeExecute) === null || _b === void 0 ? void 0 : _b.call(_a, executionContext);
            validateRequiredScopes_1.validateRequiredScopes(mutatedExeCtx !== null && mutatedExeCtx !== void 0 ? mutatedExeCtx : executionContext, requiredScopes);
            return await applyExecuteTransforms(handler, handlerFn, executionContext);
        }
        catch (err) {
            (_d = (_c = executionContext.config.hooks) === null || _c === void 0 ? void 0 : _c.onErr) === null || _d === void 0 ? void 0 : _d.call(_c, err);
            const res = getLambdaResponseForError_1.getLambdaResponseForError(err, executionContext.config);
            return addSecurityHeaders_1.addSecurityHeaders(res, executionContext);
        }
    };
}
function applyExecuteTransforms(handler, handlerFn, executionContext) {
    var _a;
    return handlerFn
        .apply(handler, (_a = getArgsForHandlerParams_1.getArgsForHandlerParams(executionContext, handler)) !== null && _a !== void 0 ? _a : [])
        .then((res) => {
        var _a;
        return ((_a = executionContext.config.response) === null || _a === void 0 ? void 0 : _a.enableAutoContentType)
            ? addInferredContentTypeBody_1.addInferredContentTypeBody(res)
            : res;
    })
        .then((res) => {
        var _a;
        return ((_a = executionContext.config.response) === null || _a === void 0 ? void 0 : _a.enableAutoHeaders)
            ? addSecurityHeaders_1.addSecurityHeaders(res, executionContext)
            : res;
    })
        .then((res) => {
        return addAdditionalHeaders_1.addAdditionalHeaders(res, executionContext);
    })
        .then((res) => {
        var _a, _b;
        const mutatedRes = (_b = (_a = executionContext.config.hooks) === null || _a === void 0 ? void 0 : _a.afterExecute) === null || _b === void 0 ? void 0 : _b.call(_a, res);
        return mutatedRes !== null && mutatedRes !== void 0 ? mutatedRes : res;
    });
}
function initializeHandler(classCtor) {
    const logger = getLogger_1.getLogger();
    try {
        return getHandlerFromInjectionContext(ts_injection_1.makeClassInjectable(classCtor));
    }
    catch (error) {
        logger === null || logger === void 0 ? void 0 : logger.error("Unable to initialize handler class.", error);
        return {
            execute: async () => {
                return new internalServerError_1.InternalServerError();
            },
        };
    }
}
function getHandlerFromInjectionContext(token) {
    let item;
    if (token) {
        item = injectionCtx.findItemByToken(token);
        if (item) {
            return item.value;
        }
    }
    throw new bigsbyError_1.BigsbyError("Can't get handler from injection context.");
}
