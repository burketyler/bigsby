"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementsError = void 0;
class EntitlementsError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = "EntitlementsError";
        Object.setPrototypeOf(this, EntitlementsError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.EntitlementsError = EntitlementsError;
