"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const constants_1 = require("../domain/constants");
const addRequestMappingRules_1 = tslib_1.__importDefault(require("../functions/addRequestMappingRules"));
const extractParamType_1 = require("../functions/extractParamType");
function Context(target, paramName, paramIndex) {
    addRequestMappingRules_1.default(target, paramName, {
        paramIndex,
        mapTo: constants_1.RequestMapTarget.CONTEXT,
        type: extractParamType_1.extractParamType(target, paramName, paramIndex),
    });
}
exports.Context = Context;
