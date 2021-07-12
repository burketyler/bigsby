export function extractParamType(
  target: Record<string, unknown>,
  paramName: string,
  paramIndex: number
): () => unknown {
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
