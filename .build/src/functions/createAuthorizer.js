"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthorizer = void 0;
const ts_injection_1 = require("ts-injection");
function createAuthorizer(Authorizer, config) {
    return (event, context, callback) => {
        return ts_injection_1.resolve(Authorizer).authorize({ context, event, callback }, config);
    };
}
exports.createAuthorizer = createAuthorizer;
