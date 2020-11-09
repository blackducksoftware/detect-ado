"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BashDetect_1 = require("../ts/BashDetect");
const fs = __importStar(require("fs"));
const fse = require("fs-extra");
const assert = require('assert');
describe('BashDetect tests', function () {
    const folder = "test_folder";
    let bashScript;
    before(function () {
        bashScript = new BashDetect_1.BashDetect();
    });
    it('validate env vars are set', function () {
        const detectKey1 = "key.1";
        const detectValue1 = "value1";
        const detectKey2 = "key.2";
        const detectValue2 = "value2";
        const detectArgs = `--${detectKey1}=${detectValue1} --${detectKey2}=${detectValue2}`;
        const env = bashScript.createEnvironmentWithVariables(detectArgs);
        assert.strictEqual(env["KEY_1"], detectValue1, "Expected to find matching env var 1");
        assert.strictEqual(env["KEY_2"], detectValue2, "Expected to find matching env var 2");
    });
    it('test script download', function (done) {
        this.timeout(10000);
        const axios = bashScript.createAxiosAgent({
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        });
        bashScript.downloadScript(axios, folder);
        assert.ok(fs.existsSync(`${folder}/${bashScript.getDownloadURL()}`), "Downloaded file did not exist");
        fse.removeSync(folder);
        done();
    });
    it('run detect script', function () {
        const blackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        };
        const detectConfiguration = {
            detectAdditionalArguments: "--blackduck.trust.cert=true --detect.project.name=Detect ADO Test",
            detectFolder: folder,
            detectVersion: "latest"
        };
        bashScript.runScript(blackduckConfiguration, detectConfiguration);
    });
});
