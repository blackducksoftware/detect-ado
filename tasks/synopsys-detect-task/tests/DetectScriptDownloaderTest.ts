import {Done} from "mocha";
import * as fileSystem from 'fs'
import {DetectScriptDownloader} from "../ts/DetectScriptDownloader";
import {BashDetectScript} from "../ts/BashDetectScript";

const fileSystemExtra = require("fs-extra")
const assert = require('assert')

describe('Detect script downloader tests', function () {
    const folder = "test_folder"

    after(function () {
        fileSystemExtra.removeSync(folder)
    })

    it('test script download', function(done: Done) {
        const detectScriptDownloader = new DetectScriptDownloader()
        detectScriptDownloader.downloadScript(undefined, BashDetectScript.DETECT_SCRIPT_NAME, folder)

        assert.ok(fileSystem.existsSync(`${folder}/${BashDetectScript.DETECT_SCRIPT_NAME}`), "Downloaded file did not exist")
        done()
    });

})
