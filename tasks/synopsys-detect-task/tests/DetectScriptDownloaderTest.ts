import * as fileSystem from 'fs'
import {DetectScriptDownloader} from '../ts/DetectScriptDownloader';
import {ShellDetectScript} from '../ts/script/ShellDetectScript';
import {IProxyInfo} from "../ts/model/IProxyInfo";

const fileSystemExtra = require('fs-extra')
const assert = require('assert')

describe('Detect script downloader tests', function () {
    const folder = 'detect'

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('test script download', async function() {
        const detectScriptDownloader = new DetectScriptDownloader()
        await detectScriptDownloader.downloadScript(undefined, ShellDetectScript.DETECT_SCRIPT_NAME, folder)

        assert.ok(fileSystem.existsSync(`${folder}/${ShellDetectScript.DETECT_SCRIPT_NAME}`), 'Downloaded file did not exist')
    });

    it('test script download bad proxy', async function() {
        const detectScriptDownloader = new DetectScriptDownloader()
        const proxyInfo: IProxyInfo = {
            proxyUrl: 'badUrl:8080',
            proxyUsername: undefined,
            proxyPassword: undefined
        }

        let exceptionThrown = false
        await detectScriptDownloader.downloadScript(proxyInfo, ShellDetectScript.DETECT_SCRIPT_NAME, folder)
            .then(() => {
                assert.fail("Should have thrown exception")
            })
            .catch(() => {
                exceptionThrown = true
            })

        assert.ok(exceptionThrown, "Should have thrown exception")
    });

})
