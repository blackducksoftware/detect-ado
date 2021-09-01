import * as fileSystem from 'fs'
import {DetectScriptDownloader} from '../ts/DetectScriptDownloader';
import {IProxyInfo} from '../ts/model/IProxyInfo';
import {DetectScriptConfigurationRunner} from '../ts/runner/DetectScriptConfigurationRunner';
import {PathResolver} from '../ts/PathResolver';

const fileSystemExtra = require('fs-extra')
const assert = require('assert')

describe('Detect script downloader tests', function () {
    const folder = PathResolver.combinePathSegments(__dirname, 'detect')

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('test script download', (done) => {
        DetectScriptDownloader.downloadScript(undefined, DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME, folder).then(response => {
            assert.ok(fileSystem.existsSync(`${folder}/${DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME}`), 'Downloaded file did not exist')
        }).finally(done)
    });

    it('test script download bad proxy', (done) => {
        const proxyInfo: IProxyInfo = {
            proxyUrl: 'badUrl:8080',
            proxyUsername: undefined,
            proxyPassword: undefined
        }

        DetectScriptDownloader.downloadScript(proxyInfo, DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME, folder)
            .then(() => {
                assert.fail('Should have thrown exception')
            })
            .catch((error) => {
                assert.ok(true)
            })
            .finally(done)
    });

})
