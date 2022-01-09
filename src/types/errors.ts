/* eslint-disable max-classes-per-file */

export class BigsbyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "BigsbyError";
    Object.setPrototypeOf(this, BigsbyError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RequestInvalidError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "RequestInvalidError";
    Object.setPrototypeOf(this, RequestInvalidError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TypeCoercionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "TypeCoercionError";
    Object.setPrototypeOf(this, TypeCoercionError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
