import {parseArguments} from "../ts/DetectUtils";

const assert = require('assert')

describe('DetectUtils tests', function () {

    it('validate argument parsing', function() {
        const firstKey = "first.key"
        const firstValue = "test"
        const secondKey = "second.key"
        const secondValue = "another"

        const detectArgs: string = `--${firstKey}=${firstValue} \n--${secondKey}=${secondValue}`
        const parsedArguments: Map<string, string> = parseArguments(detectArgs)

        assert.strictEqual(parsedArguments.size, 2, "Unexpected number of arguments extracted")
        assert.strictEqual(parsedArguments.get(firstKey), firstValue, "first values weren't parsed properly")
        assert.strictEqual(parsedArguments.get(secondKey), secondValue, "second values weren't parsed properly")
    });
});
