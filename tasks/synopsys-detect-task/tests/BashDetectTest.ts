import {DetectScript} from "../ts/DetectScript";
import {BashDetectScript} from "../ts/BashDetectScript";
import {Done} from "mocha";
import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe('BashDetect tests', function () {
    const folder = "test_folder"
    const detectVersion = "2.4.1"

    let bashScript: DetectScript

    before( function() {
        bashScript = new BashDetectScript()
    })

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('validate env vars are set', function() {
        const detectKey1 = "key.1"
        const detectValue1 = "value1"
        const detectKey2 = "key.2"
        const detectValue2 = "value2"

        const detectArgs = `--${detectKey1}=${detectValue1} --${detectKey2}=${detectValue2}`

        const env = bashScript.createEnvironmentWithVariables(detectArgs)

        assert.strictEqual(env["KEY_1"], detectValue1, "Expected to find matching env var 1")
        assert.strictEqual(env["KEY_2"], detectValue2, "Expected to find matching env var 2")
    });

    it('test script download', function(done: Done) {
        this.timeout(10000)
        const axios = bashScript.createAxiosAgent({
                blackduckApiToken: undefined,
                blackduckPassword: undefined,
                blackduckUrl: "",
                blackduckUsername: undefined,
                proxyInfo: undefined,
                useProxy: false
            })


        bashScript.downloadScript(axios, folder, detectVersion)

        assert.ok(fileSystem.existsSync(`${folder}/${bashScript.getFilename()}`), "Downloaded file did not exist")
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

        const result: number = await bashScript.runScript(blackduckConfiguration, detectConfiguration)
        assert.ok(fileSystem.existsSync(`${folder}/${bashScript.getFilename()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
