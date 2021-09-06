"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredScopes = void 0;
const entitlementsError_1 = require("../domain/errors/entitlementsError");
const bigsbyError_1 = require("../domain/errors/bigsbyError");
function validateRequiredScopes(executionContext, requiredScopes) {
    var _a, _b, _c, _d;
    if (requiredScopes.length === 0) {
        return;
    }
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const scopesFieldName = executionContext.config.auth.scopes.fieldName;
    const delimiter = executionContext.config.auth.scopes.delimiter;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    const userScopes = (_d = (_c = (_b = (_a = executionContext.config.auth) === null || _a === void 0 ? void 0 : _a.scopes) === null || _b === void 0 ? void 0 : _b.extractScopes) === null || _c === void 0 ? void 0 : _c.call(_b, executionContext.context)) !== null && _d !== void 0 ? _d : getUserScopes(executionContext, scopesFieldName, delimiter);
    validateMissingScopes(userScopes, requiredScopes);
}
exports.validateRequiredScopes = validateRequiredScopes;
function getUserScopes(executionContext, scopesFieldName, delimiter) {
    var _a;
    const userScopes = (_a = executionContext.context.authorizer) === null || _a === void 0 ? void 0 : _a[scopesFieldName];
    if (!userScopes) {
        throw new bigsbyError_1.BigsbyError(`Invalid user scopes: context.authorizer.${scopesFieldName} is undefined or not of type string`);
    }
    return userScopes.split(delimiter);
}
function validateMissingScopes(userScopes, requiredScopes) {
    const missingScopes = extractMissingScopes(userScopes, requiredScopes);
    if (missingScopes.length > 0) {
        throw new entitlementsError_1.EntitlementsError(`User is missing the following required scopes: ${missingScopes}.`);
    }
}
function extractMissingScopes(userScopes, requiredScopes) {
    return requiredScopes.reduce((missingScopes, reqScope) => {
        if (!userScopes.some((usrScope) => usrScope === reqScope)) {
            missingScopes.push(reqScope);
        }
        return missingScopes;
    }, []);
}
