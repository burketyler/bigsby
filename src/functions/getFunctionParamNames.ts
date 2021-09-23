export function getFunctionParamNames(fn: unknown): string[] {
  if (typeof fn == "function") {
    const fnText = fn
      .toString()
      .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
    const argDecl = fnText.match(/^async execute\s*[^(]*\(\s*([^)]*)\)/m);
    return (
      argDecl?.[1]?.split(",").reduce((paramNames: string[], arg) => {
        paramNames.push(arg.trim());
        return paramNames;
      }, []) ?? []
    );
  } else {
    return [];
  }
}
