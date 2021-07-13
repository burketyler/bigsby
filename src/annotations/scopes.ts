import "reflect-metadata";
import { Newable } from "ts-injection";
import { META_SCOPES } from "../domain/constants";

export function Scopes<T extends Newable>(
  ...scopes: string[]
): (classCtor: T) => void {
  return (classCtor: T): void => {
    Reflect.defineMetadata(META_SCOPES, scopes, classCtor);
  };
}
