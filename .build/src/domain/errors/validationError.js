"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ValidationError = ValidationError;
