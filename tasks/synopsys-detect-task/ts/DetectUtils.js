"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArguments = void 0;
function parseArguments(detectArguments) {
    const argMapping = new Map();
    detectArguments.split("--").forEach((value) => {
        if (value) {
            const [mapKey, mapValue] = value.split("=");
            argMapping.set(mapKey, mapValue.trim());
        }
    });
    return argMapping;
}
exports.parseArguments = parseArguments;
