import {DetectScript} from "../ts/DetectScript";
import {BashDetect} from "../ts/BashDetect";
import {PowershellDetect} from "../ts/PowershellDetect";
import fs from "fs";
import {Done} from "mocha";

const fse = require("fs-extra")
const assert = require('assert')

describe('PowershellDetect tests', function () {
    let powershellScript: DetectScript

    before( function() {
        powershellScript = new PowershellDetect()
    });

    it('validate env vars are set', function() {
        const detectKey1 = "key.1"
        const detectValue1 = "value1"
        const detectKey2 = "key.2"
        const detectValue2 = "value2"

        const detectArgs = `--${detectKey1}=${detectValue1} --${detectKey2}=${detectValue2}`

        const env = powershellScript.createEnvironmentWithVariables(detectArgs)

        assert.strictEqual(env["KEY_1"], detectValue1, "Expected to find matching env var 1")
        assert.strictEqual(env["KEY_2"], detectValue2, "Expected to find matching env var 2")
    });

    it('test script download', function(done: Done) {
        this.timeout(10000)
        const axios = powershellScript.createAxiosAgent({
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        })

        const folder = "test_folder"
        powershellScript.downloadScript(axios, folder)

        assert.ok(fs.existsSync(`${folder}/${powershellScript.getDownloadURL()}`), "Downloaded file did not exist")
        fse.removeSync(folder)
        done()
    });

    it('run detect script', function() {

    });
});
