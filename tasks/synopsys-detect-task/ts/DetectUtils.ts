// TODO verify if this parsing works for new lines (May want to separate on spaces/newlines
export function parseArguments(detectArguments: string): Map<string, string> {
    const argMapping = new Map<string, string>()
    detectArguments.split("--").forEach((value) => {
        if (value) {
            const [mapKey, mapValue] = value.split("=")
            argMapping.set(mapKey, mapValue.trim())
        }
    })

    return argMapping
}
