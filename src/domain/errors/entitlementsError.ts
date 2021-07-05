export class EntitlementsError extends Error {
  constructor(message?: string, public data?: any) {
    super(message);
    this.name = "EntitlementsError";
    Object.setPrototypeOf(this, EntitlementsError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
