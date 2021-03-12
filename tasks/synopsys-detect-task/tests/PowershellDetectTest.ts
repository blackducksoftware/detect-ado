import {DetectScript} from "../ts/script/DetectScript";
import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import {DetectSetup} from "../ts/DetectSetup";
import {DetectScriptBuilder} from "../ts/script/DetectScriptBuilder";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe.skip('PowershellDetect tests', function () {
    const folder = "detect"

    let powershellScript: DetectScript

    before( function() {
        const scriptConfig = DetectScriptBuilder.POWERSHELL_SCRIPT
        powershellScript = new DetectScript(scriptConfig)
    })

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('run detect script', async() => {
        const blackduckConfiguration: IBlackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckPassword: undefined,
            blackduckUrl: "",
            blackduckUsername: undefined,
            proxyInfo: undefined
        }

        const detectConfiguration: IDetectConfiguration = {
            detectAdditionalArguments: "--blackduck.offline.mode=true",
            detectFolder: folder,
            detectVersion: "latest"
        }

        const detectSetup = new DetectSetup()
        const env = detectSetup.createEnvironmentWithVariables(blackduckConfiguration, detectConfiguration.detectVersion, folder)

        // Remove detectVersion from other items that might have put it into the env
        delete env['DETECT_LATEST_RELEASE_VERSION']

        const result: number = await powershellScript.invokeDetect(detectConfiguration.detectAdditionalArguments, detectConfiguration.detectFolder, env)
        assert.ok(fileSystem.existsSync(`${folder}/${powershellScript.getScriptName()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
