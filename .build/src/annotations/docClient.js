"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocClient = void 0;
const tslib_1 = require("tslib");
const ts_injection_1 = require("ts-injection");
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
const bigsby_1 = require("../classes/bigsby");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
function DocClient(config = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    return (target, paramName) => {
        const mergedConfig = lodash_merge_1.default(bigsby_1.Bigsby.getConfig().ddb, config);
        const client = createClient(mergedConfig);
        ts_injection_1.injectIntoClass(target, paramName, client);
    };
}
exports.DocClient = DocClient;
function shouldCreateLocalClient(config) {
    return ((process.env.IS_OFFLINE === "true" || process.env.IS_LOCAL === "true") &&
        config.enableLocal === true);
}
function createClient(config) {
    return new dynamodb_1.DocumentClient(shouldCreateLocalClient(config) ? config.local : config.live);
}
