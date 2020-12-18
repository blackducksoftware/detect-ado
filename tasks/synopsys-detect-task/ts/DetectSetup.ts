import {IBlackduckConfiguration} from './model/IBlackduckConfiguration'
import {IDetectConfiguration} from './model/IDetectConfiguration'
import {logger} from './DetectLogger'
import task = require('azure-pipelines-task-lib/task')
import path from 'path'

export class DetectSetup {
    static findTaskVersion = () => { var task = require("../task.json"); return task.version.Major + "." + task.version.Minor + "." + task.version.Patch; }

    createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): any {
        const env = process.env
        const detectVersion: string = detectConfiguration.detectVersion
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

        const toolDirectory = task.getVariable('Agent.ToolsDirectory')
        if (toolDirectory) {
            env['DETECT_JAR_DOWNLOAD_DIR'] = path.resolve(toolDirectory, detectConfiguration.detectFolder)
        }
        env['DETECT_SOURCE_PATH'] = task.getVariable('BUILD_SOURCESDIRECTORY')

        // TODO verify this works
        env['detect.phone.home.passthrough.detect.for.ado.version'] = DetectSetup.findTaskVersion()

        return env
    }
}
