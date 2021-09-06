"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const addRequestMappingRules_1 = tslib_1.__importDefault(require("../functions/addRequestMappingRules"));
const extractParamType_1 = require("../functions/extractParamType");
const requestMapTarget_1 = require("../domain/enums/requestMapTarget");
const getFunctionParamNames_1 = require("../functions/getFunctionParamNames");
function Query(name) {
    return (target, paramName, paramIndex) => {
        const paramNames = getFunctionParamNames_1.getFunctionParamNames(target[paramName]);
        addRequestMappingRules_1.default(target, paramName, {
            paramIndex,
            mapTo: requestMapTarget_1.RequestMapTarget.QUERY,
            type: extractParamType_1.extractParamType(target, paramName, paramIndex),
            searchKey: name !== null && name !== void 0 ? name : paramNames[paramIndex],
        });
    };
}
exports.Query = Query;
