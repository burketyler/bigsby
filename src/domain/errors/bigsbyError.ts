export class BigsbyError extends Error {
  constructor(message?: string, public err?: Error) {
    super(message);
    this.name = "BigsbyError";
    Object.setPrototypeOf(this, BigsbyError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
