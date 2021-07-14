"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgsForHandlerParams = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("../domain/constants");
const ts_injection_1 = require("ts-injection");
const requestMapTarget_1 = require("../domain/enums/requestMapTarget");
const bigsby_1 = require("../classes/bigsby");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
function getArgsForHandlerParams(context, handler) {
    var _a;
    return (_a = getRules(handler)) === null || _a === void 0 ? void 0 : _a.sort(sortByParamIndex).reduce((argCollector, rule) => {
        argCollector.push(processRule(rule, context));
        return argCollector;
    }, []);
}
exports.getArgsForHandlerParams = getArgsForHandlerParams;
function sortByParamIndex(a, b) {
    return a.paramIndex - b.paramIndex;
}
function getRules(handler) {
    return Reflect.getOwnMetadata(constants_1.META_REQUEST_MAPPING, handler.constructor, constants_1.HandlerExecuteMethod);
}
function processRule(rule, context) {
    const event = context.event;
    const config = lodash_merge_1.default(bigsby_1.Bigsby.getConfig().lambda, context.config);
    switch (rule.mapTo) {
        case requestMapTarget_1.RequestMapTarget.CONTEXT:
            return context;
        case requestMapTarget_1.RequestMapTarget.BODY:
            return processBodyRule(event, context);
        case requestMapTarget_1.RequestMapTarget.PATH:
            return processPathRule(event, rule, config);
        case requestMapTarget_1.RequestMapTarget.QUERY:
            return processQueryRule(event, rule, config);
        case requestMapTarget_1.RequestMapTarget.HEADER:
            return processHeaderRule(event, rule, config);
        default:
            throw new Error(`Unimplemented request map target: ${rule.mapTo}`);
    }
}
function processPathRule(event, rule, config) {
    var _a;
    return parseAsType(rule, (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a[rule.searchKey], event.body, config);
}
function processBodyRule(event, context) {
    var _a, _b, _c, _d, _e;
    const contentType = getContentType(event.headers);
    switch (contentType) {
        case "application/json":
            return ((_d = (_c = (_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.request) === null || _b === void 0 ? void 0 : _b.jsonParser) === null || _c === void 0 ? void 0 : _c.call(_b, event.body)) !== null && _d !== void 0 ? _d : JSON.parse((_e = event.body) !== null && _e !== void 0 ? _e : ""));
        default:
            return event.body;
    }
}
function getContentType(headers) {
    var _a;
    return (_a = headers["content-type"]) !== null && _a !== void 0 ? _a : headers["Content-Type"];
}
function processQueryRule(event, rule, config) {
    var _a;
    return parseAsType(rule, (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a[rule.searchKey], event.body, config);
}
function processHeaderRule(event, rule, config) {
    var _a;
    return parseAsType(rule, (_a = event.headers) === null || _a === void 0 ? void 0 : _a[rule.searchKey], event.body, config);
}
function parseAsType(rule, value, body, config) {
    var _a, _b, _c, _d;
    if ((_a = config.request) === null || _a === void 0 ? void 0 : _a.enableInferType) {
        switch (rule.type) {
            case ts_injection_1.PrimitiveType.NUMBER:
                return Number(value);
            case ts_injection_1.PrimitiveType.BOOLEAN:
                return value === "true";
            case ts_injection_1.PrimitiveType.OBJECT:
                return (_d = (_c = (_b = config.request) === null || _b === void 0 ? void 0 : _b.jsonParser) === null || _c === void 0 ? void 0 : _c.call(_b, body)) !== null && _d !== void 0 ? _d : JSON.parse(body !== null && body !== void 0 ? body : "");
            default:
                return value;
        }
    }
    else {
        return value;
    }
}
