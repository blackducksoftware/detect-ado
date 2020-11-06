"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DetectUtils_1 = require("../ts/DetectUtils");
const assert = require('assert');
describe('DetectUtils tests', function () {
    before(function () {
    });
    after(() => {
    });
    it('validate argument parsing', function () {
        const firstKey = "first.key";
        const firstValue = "test";
        const secondKey = "second.key";
        const secondValue = "another";
        const detectArgs = `--${firstKey}=${firstValue} --${secondKey}=${secondValue}`;
        const parsedArguments = DetectUtils_1.parseArguments(detectArgs);
        assert.strictEqual(parsedArguments.size, 2, "Unexpected number of arguments extracted");
        assert.strictEqual(parsedArguments.get(firstKey), firstValue, "first values weren't parsed properly");
        assert.strictEqual(parsedArguments.get(secondKey), secondValue, "second values weren't parsed properly");
    });
});
