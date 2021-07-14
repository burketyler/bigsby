"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = void 0;
const ts_injection_1 = require("ts-injection");
const constants_1 = require("../domain/constants");
function createHandler(app, config = {}) {
    return (event, context) => {
        ts_injection_1.register({
            event,
            context,
            config,
        }, constants_1.TKN_CONTEXT);
        return ts_injection_1.resolve(app).execute(event, context, config);
    };
}
exports.createHandler = createHandler;
