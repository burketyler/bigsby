export function getFunctionParamNames(fn: unknown): string[] {
  if (typeof fn == "function") {
    const fnText = fn
      .toString()
      .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
    const argDecl = fnText.match(/^async execute\s*[^(]*\(\s*([^)]*)\)/m);
    return (
      argDecl?.slice(1).reduce((paramNames: string[], arg) => {
        paramNames.push(arg);
        return paramNames;
      }, []) ?? []
    );
  } else {
    return [];
  }
}
