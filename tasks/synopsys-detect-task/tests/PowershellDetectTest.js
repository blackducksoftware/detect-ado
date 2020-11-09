"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PowershellDetect_1 = require("../ts/PowershellDetect");
const fs_1 = __importDefault(require("fs"));
const fse = require("fs-extra");
const assert = require('assert');
describe('PowershellDetect tests', function () {
    let powershellScript;
    before(function () {
        powershellScript = new PowershellDetect_1.PowershellDetect();
    });
    it('validate env vars are set', function () {
        const detectKey1 = "key.1";
        const detectValue1 = "value1";
        const detectKey2 = "key.2";
        const detectValue2 = "value2";
        const detectArgs = `--${detectKey1}=${detectValue1} --${detectKey2}=${detectValue2}`;
        const env = powershellScript.createEnvironmentWithVariables(detectArgs);
        assert.strictEqual(env["KEY_1"], detectValue1, "Expected to find matching env var 1");
        assert.strictEqual(env["KEY_2"], detectValue2, "Expected to find matching env var 2");
    });
    it('test script download', function (done) {
        this.timeout(10000);
        const axios = powershellScript.createAxiosAgent({
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        });
        const folder = "test_folder";
        powershellScript.downloadScript(axios, folder);
        assert.ok(fs_1.default.existsSync(`${folder}/${powershellScript.getDownloadURL()}`), "Downloaded file did not exist");
        fse.removeSync(folder);
        done();
    });
    it('run detect script', function () {
    });
});
