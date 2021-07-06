"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRequestParamMapping = void 0;
const constants_1 = require("../domain/constants");
const ts_injection_1 = require("ts-injection");
function applyRequestParamMapping(handler) {
    const handlerFn = handler.execute;
    handler.execute = async (event, context, config) => {
        var _a;
        const args = (_a = getRules(handler)) === null || _a === void 0 ? void 0 : _a.sort(sortByParamIndex).reduce((argCollector, rule) => {
            argCollector.push(processRule(rule, { event, context, config }));
            return argCollector;
        }, []);
        return await handlerFn.apply(handler, [config, ...(args !== null && args !== void 0 ? args : [])]);
    };
}
exports.applyRequestParamMapping = applyRequestParamMapping;
function sortByParamIndex(a, b) {
    return a.paramIndex - b.paramIndex;
}
function getRules(handler) {
    return Reflect.getOwnMetadata(constants_1.META_REQUEST_MAPPING, handler.constructor, constants_1.HandlerExecuteMethod);
}
function processRule(rule, context) {
    const event = context.event;
    switch (rule.mapTo) {
        case constants_1.RequestMapTarget.CONTEXT:
            return context;
        case constants_1.RequestMapTarget.BODY:
            return processBodyRule(event, context);
        case constants_1.RequestMapTarget.PATH:
            return processPathRule(event, rule, context);
        case constants_1.RequestMapTarget.QUERY:
            return processQueryRule(event, rule, context);
        case constants_1.RequestMapTarget.HEADER:
            return processHeaderRule(event, rule, context);
        default:
            throw new Error(`Unimplemented request map target: ${rule.mapTo}`);
    }
}
function processPathRule(event, rule, context) {
    var _a;
    return parseAsType(rule, (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a[rule.searchKey], context);
}
function processBodyRule(event, context) {
    var _a, _b, _c, _d;
    const contentType = getContentType(event.headers);
    switch (contentType) {
        case "application/json":
            return ((_c = (_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.jsonParser) === null || _b === void 0 ? void 0 : _b.call(_a, event.body)) !== null && _c !== void 0 ? _c : JSON.parse((_d = event.body) !== null && _d !== void 0 ? _d : ""));
        default:
            return event.body;
    }
}
function getContentType(headers) {
    var _a;
    return (_a = headers["content-type"]) !== null && _a !== void 0 ? _a : headers["Content-Type"];
}
function processQueryRule(event, rule, context) {
    var _a;
    return parseAsType(rule, (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a[rule.searchKey], context);
}
function processHeaderRule(event, rule, context) {
    var _a;
    return parseAsType(rule, (_a = event.headers) === null || _a === void 0 ? void 0 : _a[rule.searchKey], context);
}
function parseAsType(rule, value, context) {
    var _a, _b, _c, _d;
    switch (rule.type) {
        case ts_injection_1.PrimitiveType.NUMBER:
            return Number(value);
        case ts_injection_1.PrimitiveType.BOOLEAN:
            return value === "true";
        case ts_injection_1.PrimitiveType.OBJECT:
            return ((_c = (_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.jsonParser) === null || _b === void 0 ? void 0 : _b.call(_a, context.event.body)) !== null && _c !== void 0 ? _c : JSON.parse((_d = context.event.body) !== null && _d !== void 0 ? _d : ""));
        default:
            return value;
    }
}
