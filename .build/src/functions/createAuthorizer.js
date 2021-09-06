"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthorizer = void 0;
function createAuthorizer(Authorizer, config) {
    return (event, context, callback) => {
        return new Authorizer(config).authorize({
            context,
            event,
            callback,
        });
    };
}
exports.createAuthorizer = createAuthorizer;
