export function createGlobalBindings(instanceName: string) {
  return (): Record<string, unknown> => {
    return {
      ns: instanceName,
    };
  };
}
