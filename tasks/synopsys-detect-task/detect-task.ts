import task = require("azure-pipelines-task-lib/task");
import {IBlackduckConfiguration} from './ts/model/IBlackduckConfiguration'
import {IDetectConfiguration} from './ts/model/IDetectConfiguration'
import {IAdditionalConfiguration} from './ts/model/IAdditionalConfiguration'
import {DetectADOConstants} from './ts/DetectADOConstants'
import {IProxyInfo} from './ts/model/IProxyInfo'
import {DetectScript} from './ts/script/DetectScript';
import fileSystem from 'fs';
import {logger} from './ts/DetectLogger'
import {DetectScriptDownloader} from './ts/DetectScriptDownloader';
import {DetectSetup} from './ts/DetectSetup';
import {PathResolver} from "./ts/PathResolver";
import {DetectScriptConfigurationBuilder} from "./ts/script/DetectScriptConfigurationBuilder";
import {IDetectScriptConfiguration} from "./ts/model/IDetectScriptConfiguration";

async function run() {
    logger.info('Starting Detect Task')
    try {
        const blackduckConfiguration: IBlackduckConfiguration = getBlackduckConfiguration()
        const detectConfiguration: IDetectConfiguration = getDetectConfiguration()
        const additionalConfiguration: IAdditionalConfiguration = getAdditionalConfiguration()

        const detectScriptConfiguration: IDetectScriptConfiguration = DetectScriptConfigurationBuilder.createScriptConfiguration()
        const detectScript: DetectScript = new DetectScript(detectScriptConfiguration)

        const workingDirectory = PathResolver.getWorkingDirectory() || ""
        const scriptFolder: string = PathResolver.combinePathSegments(workingDirectory, DetectADOConstants.SCRIPT_DETECT_FOLDER)

        try {
            await DetectScriptDownloader.downloadScript(blackduckConfiguration.proxyInfo, detectScript.getScriptName(), scriptFolder)
        } catch (error) {
            logger.error(`Unable to connect with ${DetectScriptDownloader.DETECT_DOWNLOAD_URL}`)
            logger.error('This may be a problem with your proxy setup or network.')

            const resultError = `There was an issue downloading the Detect script: ${error}`
            if(additionalConfiguration.addTaskSummary) {
                addSummaryAttachment(resultError)
            }
            task.setResult(task.TaskResult.Failed, resultError)
            return
        }

        const env = DetectSetup.createEnvironmentWithVariables(blackduckConfiguration, detectConfiguration.detectVersion, detectConfiguration.detectFolder)
        const cleanedArguments = DetectSetup.convertArgumentsToPassableValues(detectConfiguration.detectAdditionalArguments)
        const detectResult: number = await detectScript.invokeDetect(cleanedArguments, scriptFolder, env)

        logger.info('Finished running detect, updating task information')
        if (additionalConfiguration.addTaskSummary) {
            logger.info('Adding task summary')
            const content = (detectResult == 0) ? 'Detect ran successfully' : `There was an issue running detect, exit code: ${detectResult}`
            addSummaryAttachment(content)
        }

        if (detectResult != 0) {
            task.setResult(task.TaskResult.Failed, `Detect run failed, received error code: ${detectResult}`)
            return
        }
    } catch (e) {
        task.setResult(task.TaskResult.Failed, `An unexpected error occurred: ${e}`)
    }
}

function addSummaryAttachment(content: string) {
    const attachmentFilePath: string = Date.now().toString()
    const fullPath: string = PathResolver.combinePathSegments(__dirname, attachmentFilePath)
    fileSystem.writeFileSync(fullPath, content)
    task.addAttachment('Distributedtask.Core.Summary', 'Synopsys Detect', fullPath)
}

function getBlackduckConfiguration(): IBlackduckConfiguration {
    logger.info('Retrieving Blackduck configuration')
    const blackduckService: string = task.getInput(DetectADOConstants.BLACKDUCK_ID, true)!
    const blackduckUrl: string = task.getEndpointUrl(blackduckService, false)!
    const blackduckToken: string | undefined = task.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_API_TOKEN, true)
    const blackduckUsername: string | undefined = task.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_USERNAME, true)
    const blackduckPassword: string | undefined = task.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_PASSWORD, true)

    let blackduckProxyInfo: IProxyInfo | undefined
    const blackduckProxyService: string | undefined = task.getInput(DetectADOConstants.BLACKDUCK_PROXY_ID, false)
    if (blackduckProxyService) {
        const proxyUrl: string = task.getEndpointUrl(blackduckProxyService, true)!
        const proxyUsername : string | undefined = task.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants.PROXY_USERNAME, true)
        const proxyPassword: string | undefined = task.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants.PROXY_PASSWORD, true)

        blackduckProxyInfo = {
            proxyUrl,
            proxyUsername,
            proxyPassword
        }
    }

    return {
        blackduckUrl,
        blackduckApiToken: blackduckToken,
        blackduckUsername,
        blackduckPassword,
        proxyInfo: blackduckProxyInfo
    }
}

function getDetectConfiguration(): IDetectConfiguration {
    logger.info('Retrieving Detect configuration')
    const additionalArguments: string = task.getInput(DetectADOConstants.DETECT_ARGUMENTS, false) || ''
    const detectFolder: string = task.getInput(DetectADOConstants.DETECT_FOLDER, false) || PathResolver.getToolDirectory() || 'detect'
    const detectVersion: string = task.getInput(DetectADOConstants.DETECT_VERSION, false) || 'latest'

    return {
        detectAdditionalArguments: additionalArguments,
        detectFolder,
        detectVersion
    }
}

function getAdditionalConfiguration(): IAdditionalConfiguration {
    logger.info('Retrieving additional configuration')
    const addTask: boolean = task.getBoolInput(DetectADOConstants.ADD_TASK_SUMMARY, false)

    return {
        addTaskSummary: addTask
    }
}

run()
