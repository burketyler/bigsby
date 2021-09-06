"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../domain/constants");
function addRequestMappingRules(targetClass, paramName, rule) {
    const rules = getRulesOnTargetClass(targetClass, paramName);
    rules.push(rule);
    setRulesOnTargetClass(targetClass, paramName, rules);
}
exports.default = addRequestMappingRules;
function getRulesOnTargetClass(targetClass, paramName) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(constants_1.META_REQUEST_MAPPING, targetClass.constructor, paramName)) !== null && _a !== void 0 ? _a : []);
}
function setRulesOnTargetClass(targetClass, paramName, rules) {
    Reflect.defineMetadata(constants_1.META_REQUEST_MAPPING, rules, targetClass.constructor, paramName);
}
