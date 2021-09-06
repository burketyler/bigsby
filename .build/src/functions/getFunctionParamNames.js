"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionParamNames = void 0;
function getFunctionParamNames(fn) {
    var _a;
    if (typeof fn == "function") {
        const fnText = fn
            .toString()
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
        const argDecl = fnText.match(/^async execute\s*[^(]*\(\s*([^)]*)\)/m);
        return ((_a = argDecl === null || argDecl === void 0 ? void 0 : argDecl.slice(1).reduce((paramNames, arg) => {
            paramNames.push(arg);
            return paramNames;
        }, [])) !== null && _a !== void 0 ? _a : []);
    }
    else {
        return [];
    }
}
exports.getFunctionParamNames = getFunctionParamNames;
