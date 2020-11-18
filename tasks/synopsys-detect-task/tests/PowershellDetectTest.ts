import {DetectScript} from "../ts/DetectScript";
import {PowershellDetectScript} from "../ts/PowershellDetectScript";
import fs from "fs";
import {Done} from "mocha";
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import fileSystem from "fs";

const fse = require("fs-extra")
const assert = require('assert')

describe.skip('PowershellDetect tests', function () {
    const folder = "test_folder"

    let powershellScript: DetectScript

    before( function() {
        powershellScript = new PowershellDetectScript()
    });

    it('validate env vars are set', function() {
        const detectKey1 = "key.1"
        const detectValue1 = "value1"
        const detectKey2 = "key.2"
        const detectValue2 = "value2"

        const detectArgs = `--${detectKey1}=${detectValue1} --${detectKey2}=${detectValue2}`

        const config: IDetectConfiguration = {
            detectFolder: folder,
            detectVersion: "",
            detectAdditionalArguments: detectArgs
        }
        const env = powershellScript.createEnvironmentWithVariables(config)

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


        powershellScript.downloadScript(axios, folder)

        assert.ok(fs.existsSync(`${folder}/${powershellScript.getFilename()}`), "Downloaded file did not exist")
        fse.removeSync(folder)
        done()
    });

    it('run detect script', async() => {
        const blackduckConfiguration: IBlackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        }

        const detectConfiguration: IDetectConfiguration = {
            detectAdditionalArguments: "--blackduck.trust.cert=true --detect.project.name=Detect ADO Test",
            detectFolder: folder,
            detectVersion: "latest"
        }

        const result: number = await powershellScript.runScript(blackduckConfiguration, detectConfiguration)
        assert.ok(fileSystem.existsSync(`${folder}/${powershellScript.getFilename()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
