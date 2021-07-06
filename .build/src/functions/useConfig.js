"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfig = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
let config;
function useConfig() {
    var _a;
    if (!config) {
        config = (_a = getConfig()) !== null && _a !== void 0 ? _a : {};
    }
    return config;
}
exports.useConfig = useConfig;
function getConfig() {
    const appDir = fs.realpathSync(process.cwd());
    const configPath = path.join(appDir, "config.js");
    if (fs.existsSync(configPath)) {
        return require(configPath);
    }
}
