"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoClient = void 0;
const ts_injection_1 = require("ts-injection");
const aws_sdk_1 = require("aws-sdk");
const useConfig_1 = require("../functions/useConfig");
function DynamoClient(config) {
    return (target, paramName) => {
        const isLocal = process.env.IS_LOCAL;
        const client = isLocal
            ? createLocalClient(useConfig_1.useConfig())
            : createClient(config);
        ts_injection_1.injectIntoClass(target, paramName, client);
    };
}
exports.DynamoClient = DynamoClient;
function createLocalClient(config) {
    var _a, _b;
    return new aws_sdk_1.DynamoDB({
        region: "localhost",
        endpoint: `http://localhost:${(_b = (_a = config.ddb) === null || _a === void 0 ? void 0 : _a.localPort) !== null && _b !== void 0 ? _b : "8000"}`,
        accessKeyId: "DEFAULT_ACCESS_KEY",
        secretAccessKey: "DEFAULT_SECRET",
    });
}
function createClient(config) {
    return new aws_sdk_1.DynamoDB(config);
}
