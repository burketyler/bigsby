"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigsbyError = void 0;
class BigsbyError extends Error {
    constructor(message, err) {
        super(message);
        this.err = err;
        this.name = "BigsbyError";
        Object.setPrototypeOf(this, BigsbyError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BigsbyError = BigsbyError;
