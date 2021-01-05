import {IBlackduckConfiguration} from './model/IBlackduckConfiguration'
import {logger} from './DetectLogger'
import {PathResolver} from './PathResolver';

export class DetectSetup {
    static findTaskVersion = () => { var task = require("../task.json"); return task.version.Major + "." + task.version.Minor + "." + task.version.Patch; }

    createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration, detectVersion: string, detectDownloadPath: string): any {
        const env = process.env
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }

        env['BLACKDUCK_URL'] = blackduckConfiguration.blackduckUrl

        if(blackduckConfiguration.blackduckApiToken) {
            logger.info('Using blackduck API token')
            env['BLACKDUCK_API_TOKEN'] = blackduckConfiguration.blackduckApiToken
        } else {
            logger.info("Using blackduck username and password")
            env['BLACKDUCK_USERNAME'] = blackduckConfiguration.blackduckUsername
            env['BLACKDUCK_PASSWORD'] = blackduckConfiguration.blackduckPassword
        }

        // Set according to the Powershell script
        env['DETECT_EXIT_CODE_PASSTHRU'] = "1"
        // Something was setting this to 'undefined' which could cause issues with the script
        env['DETECT_SOURCE'] = ""

        if (detectDownloadPath) {
            env['DETECT_JAR_DOWNLOAD_DIR'] = detectDownloadPath
        }
        env['DETECT_SOURCE_PATH'] = PathResolver.getBuildSourceDirectory()

        // TODO verify this works
        env['detect.phone.home.passthrough.detect.for.ado.version'] = DetectSetup.findTaskVersion()

        return env
    }
}
