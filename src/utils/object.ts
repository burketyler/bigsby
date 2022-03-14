// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function freezeDeep<T>(obj: T): T {
  Object.keys(obj).forEach((prop) => {
    if (
      typeof obj[prop as keyof T] === "object" &&
      !Object.isFrozen(obj[prop as keyof T])
    ) {
      freezeDeep(obj[prop as keyof T]);
    }
  });

  return Object.freeze(obj);
}
