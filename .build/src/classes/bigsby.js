"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bigsby = void 0;
const tslib_1 = require("tslib");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
const defaultConfig_1 = require("../domain/defaultConfig");
class BigsbyInstance {
    constructor() {
        this.config = defaultConfig_1.defaultConfig;
    }
    setConfig(config) {
        this.config = lodash_merge_1.default(defaultConfig_1.defaultConfig, config);
    }
    getConfig() {
        return this.config;
    }
}
exports.Bigsby = new BigsbyInstance();
