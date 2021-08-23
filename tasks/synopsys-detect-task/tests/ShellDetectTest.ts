import {DetectScript} from '../ts/script/DetectScript';
import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import {DetectSetup} from "../ts/DetectSetup";
import {DetectScriptDownloader} from "../ts/DetectScriptDownloader";
import {DetectScriptConfigurationBuilder} from "../ts/script/DetectScriptConfigurationBuilder";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe.skip('ShellDetect tests', function () {
    const folder = "detect"

    let shellScript: DetectScript

    before( function() {
        const scriptConfig = DetectScriptConfigurationBuilder.SHELL_SCRIPT
        shellScript = new DetectScript(scriptConfig)
    })

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('run detect script', async() => {
        const blackduckConfiguration: IBlackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckUrl: "",
            proxyInfo: undefined
        }

        const detectConfiguration: IDetectConfiguration = {
            detectAdditionalArguments: "--blackduck.offline.mode=true --detect.tools.excluded=SIGNATURE_SCAN",
            detectFolder: folder,
            detectVersion: "latest"
        }

        const env = DetectSetup.createEnvironmentWithVariables(blackduckConfiguration, detectConfiguration.detectVersion, folder)
        env['DETECT_SOURCE_PATH'] = '.'

        // Remove detectVersion from other items that might have put it into the env
        delete env['DETECT_LATEST_RELEASE_VERSION']

        await DetectScriptDownloader.downloadScript(undefined, shellScript.getScriptName(), folder)

        const result: number = await shellScript.invokeDetect(detectConfiguration.detectAdditionalArguments, detectConfiguration.detectFolder, env)
        assert.ok(fileSystem.existsSync(`${folder}/${shellScript.getScriptName()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
