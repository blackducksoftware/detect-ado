import * as fileSystem from 'fs'
import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";
import {DetectScriptConfigurationRunner} from "../ts/runner/DetectScriptConfigurationRunner";
import {PathResolver} from "../ts/PathResolver";

const fileSystemExtra = require('fs-extra')
const assert = require('assert')

// FIXME properly cleanup after this test so that no additional files exist in the project (May be another test not cleaning properly)
describe.skip('DetectScript tests', function () {
    const folder = PathResolver.combinePathSegments(__dirname, 'detect')

    // Must delete this data in case other data exists there
    before(function () {
        delete process.env['DETECT_SOURCE_PATH']
        delete process.env['DETECT_LATEST_RELEASE_VERSION']
    })

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('run detect script', (done) => {
        const blackduckConfiguration: IBlackduckConfiguration = {
            blackduckApiToken: '',
            blackduckUrl: '',
            proxyInfo: undefined
        }

        const detectConfiguration: IDetectConfiguration = {
            detectAdditionalArguments: '--blackduck.offline.mode=true --detect.tools.excluded=SIGNATURE_SCAN',
            detectFolder: folder,
            detectVersion: 'latest',
            useAirGap: false,
            detectAirGapJarPath: ''
        }

        const scriptRunner = new DetectScriptConfigurationRunner(blackduckConfiguration, detectConfiguration)
        const runnerConfig = scriptRunner.createRunnerConfiguration()

        scriptRunner.invokeDetect().then(response => {
            assert.ok(fileSystem.existsSync(`${folder}/${runnerConfig.fileName}`), 'Downloaded file did not exist')
            assert.strictEqual(0, response, 'Detect scan should have ended in success')
        }).catch(error => {
            assert.fail(`Detect failed with: ${error}`)
        }).finally(done)
    });
});
