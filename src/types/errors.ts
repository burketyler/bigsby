/* eslint-disable max-classes-per-file */

import { ValidationError } from "joi";

export class BigsbyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "BigsbyError";
    Object.setPrototypeOf(this, BigsbyError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RequestParseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "RequestParseError";
    Object.setPrototypeOf(this, RequestParseError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResponseParseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ResponseParseError";
    Object.setPrototypeOf(this, ResponseParseError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RequestInvalidError extends Error {
  constructor(public readonly validateErr: ValidationError, message?: string) {
    super(message);
    this.name = "RequestInvalidError";
    Object.setPrototypeOf(this, RequestInvalidError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResponseInvalidError extends Error {
  constructor(public readonly validateErr: ValidationError, message?: string) {
    super(message);
    this.name = "ResponseInvalidError";
    Object.setPrototypeOf(this, ResponseInvalidError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends Error {
  constructor(public readonly userError: unknown, message?: string) {
    super(message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
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
