import {DetectScript} from '../ts/script/DetectScript';
import {ShellDetectScript} from '../ts/script/ShellDetectScript';
import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import {DetectSetup} from "../ts/DetectSetup";
import {DetectScriptDownloader} from "../ts/DetectScriptDownloader";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe.skip('BashDetect tests', function () {
    const folder = "detect"

    let bashScript: DetectScript

    before( function() {
        bashScript = new ShellDetectScript()
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

        const scriptDownloader = new DetectScriptDownloader()
        await scriptDownloader.downloadScript(undefined, bashScript.getScriptName(), folder)

        const result: number = await bashScript.invokeDetect(detectConfiguration.detectAdditionalArguments, detectConfiguration.detectFolder, env)
        assert.ok(fileSystem.existsSync(`${folder}/${bashScript.getScriptName()}`), "Downloaded file did not exist")
        assert.strictEqual(0, result, "Detect scan should have ended in success")
    });
});
