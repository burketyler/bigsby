"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const addRequestMappingRules_1 = tslib_1.__importDefault(require("../functions/addRequestMappingRules"));
const extractParamType_1 = require("../functions/extractParamType");
const requestMapTarget_1 = require("../domain/enums/requestMapTarget");
function Body(target, paramName, paramIndex) {
    addRequestMappingRules_1.default(target, paramName, {
        paramIndex,
        mapTo: requestMapTarget_1.RequestMapTarget.BODY,
        type: extractParamType_1.extractParamType(target, paramName, paramIndex),
    });
}
exports.Body = Body;
