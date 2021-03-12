import * as fileSystem from 'fs'
import {DetectScriptDownloader} from '../ts/DetectScriptDownloader';
import {IProxyInfo} from "../ts/model/IProxyInfo";
import {DetectScriptConfigurationBuilder} from "../ts/script/DetectScriptConfigurationBuilder";

const fileSystemExtra = require('fs-extra')
const assert = require('assert')

describe('Detect script downloader tests', function () {
    const folder = 'detect'

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('test script download', async function() {
        await DetectScriptDownloader.downloadScript(undefined, DetectScriptConfigurationBuilder.DETECT_SH_SCRIPT_NAME, folder)

        assert.ok(fileSystem.existsSync(`${folder}/${DetectScriptConfigurationBuilder.DETECT_SH_SCRIPT_NAME}`), 'Downloaded file did not exist')
    });

    it('test script download bad proxy', async function() {
        const proxyInfo: IProxyInfo = {
            proxyUrl: 'badUrl:8080',
            proxyUsername: undefined,
            proxyPassword: undefined
        }

        let exceptionThrown = false
        await DetectScriptDownloader.downloadScript(proxyInfo, DetectScriptConfigurationBuilder.DETECT_SH_SCRIPT_NAME, folder)
            .then(() => {
                assert.fail("Should have thrown exception")
            })
            .catch(() => {
                exceptionThrown = true
            })

        assert.ok(exceptionThrown, "Should have thrown exception")
    });

})
