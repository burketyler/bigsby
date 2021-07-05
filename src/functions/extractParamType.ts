export function extractParamType(
  target: any,
  paramName: string,
  paramIndex: number
): () => any {
  const paramType = Reflect.getMetadata(
    "design:paramtypes",
    target,
    paramName
  )?.[paramIndex];
  if (!paramType) {
    throw new Error(
      `Unable to determine param type of ${target}.${paramName}.${paramIndex}`
    );
  }
  return paramType;
}
