export class ConditionCheckFailError extends Error {
  constructor(message?: string, public data?: any) {
    super(message);
    this.name = "ConditionCheckFailError";
    Object.setPrototypeOf(this, ConditionCheckFailError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
