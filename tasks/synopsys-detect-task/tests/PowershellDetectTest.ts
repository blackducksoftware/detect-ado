import {DetectScript} from "../ts/DetectScript";
import {BashDetectScript} from "../ts/BashDetectScript";
import {Done} from "mocha";
import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import {PowershellDetectScript} from "../ts/PowershellDetectScript";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe('BashDetect tests', function () {
    const folder = "test_folder_2"

    let powershellScript: DetectScript

    before( function() {
        powershellScript = new PowershellDetectScript()
    })

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it.skip('run detect script', async() => {
        const blackduckConfiguration: IBlackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined,
            useProxy: false
        }

        const detectConfiguration: IDetectConfiguration = {
            detectAdditionalArguments: "--blackduck.offline.mode=true",
            detectFolder: folder,
            detectVersion: "latest"
        }

        const result: number = await powershellScript.runScript(blackduckConfiguration, detectConfiguration)
        assert.ok(fileSystem.existsSync(`${folder}/${powershellScript.getScriptName()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
