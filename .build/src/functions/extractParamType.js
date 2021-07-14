"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractParamType = void 0;
function extractParamType(target, paramName, paramIndex) {
    var _a;
    const paramType = (_a = Reflect.getMetadata("design:paramtypes", target, paramName)) === null || _a === void 0 ? void 0 : _a[paramIndex];
    if (!paramType) {
        throw new Error(`Unable to determine param type of ${target}.${paramName}.${paramIndex}`);
    }
    return paramType;
}
exports.extractParamType = extractParamType;
