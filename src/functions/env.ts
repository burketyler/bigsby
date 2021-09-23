import { BigsbyError } from "../domain/errors/bigsbyError";

export function env(varName: string): string {
  const value = process.env[varName];

  if (!value) {
    throw new BigsbyError(`Environment variable ${varName} is undefined.`);
  }

  return value;
}
