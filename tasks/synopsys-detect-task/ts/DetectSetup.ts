import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
import {IDetectConfiguration} from "./model/IDetectConfiguration";
import {logger} from "./DetectLogger";
import * as task from "azure-pipelines-task-lib";
import path from "path";

export class DetectSetup {
    createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): any {
        const env = process.env
        const detectVersion: string = detectConfiguration.detectVersion
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }

        env['BLACKDUCK_URL'] = blackduckConfiguration.blackduckUrl

        if(blackduckConfiguration.blackduckApiToken) {
            logger.info("Using blackduck API token")
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
            env["DETECT_JAR_DOWNLOAD_DIR"] = path.resolve(toolDirectory, "detect")
        }
        env['DETECT_SOURCE_PATH'] = task.getVariable('BUILD_SOURCESDIRECTORY')

        return env
    }
}
