import * as tl from 'azure-pipelines-task-lib/task'
import * as os from 'os'
import {IBlackduckConfiguration} from "./ts/model/IBlackduckConfiguration"
import {IDetectConfiguration} from "./ts/model/IDetectConfiguration"
import {ITaskConfiguration} from "./ts/model/ITaskConfiguration"
import {DetectADOConstants} from "./ts/DetectADOConstants"
import {IProxyInfo} from "./ts/model/IProxyInfo"
import {DetectScript} from "./ts/DetectScript";
import {PowershellDetectScript} from "./ts/PowershellDetectScript";
import {BashDetectScript} from "./ts/BashDetectScript";
const winston = require("winston")

const log = winston.createLogger({
    level: "debug",
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

const osPlat: string = os.platform()

async function run() {
    log.info('Starting Detect Task')
    try {
        const blackduckConfiguration: IBlackduckConfiguration = getBlackduckConfiguration()
        const detectConfiguration: IDetectConfiguration = getDetectConfiguration()
        const taskConfiguration: ITaskConfiguration = getTaskConfiguration()

        const detectResult: number = await invokeDetect(blackduckConfiguration, detectConfiguration)
        log.info('Finished running detect, updating task information')
        if (taskConfiguration.addTaskSummary) {
            log.info('Adding task summary')
            const content = (detectResult == 0) ? "Detect ran successfully" : `There was an issue running detect, exit code: ${detectResult}`
            // Could also be task.addattachment
            // TODO Find out how to add an attachment if this doesn't work
            tl.setTaskVariable('Distributedtask.Core.Summary', content, false)
        }
        tl.setResult(tl.TaskResult.Succeeded, "Test Success (Not yet implemented)", true)
    } catch (e) {
        tl.setResult(tl.TaskResult.Failed, `An unexpected error occurred: ${e}`)
    }
}

function invokeDetect(blackduckData: IBlackduckConfiguration, detectArguments: IDetectConfiguration): Promise<number> {
    let detectScript: DetectScript
    if ("win32" == osPlat) {
        log.info('Detected Windows: Running powershell script')
        detectScript = new PowershellDetectScript()
    } else {
        log.info('Windows not detected: Running shell script')
        detectScript = new BashDetectScript()
    }

    return detectScript.runScript(blackduckData, detectArguments)
}

function getBlackduckConfiguration(): IBlackduckConfiguration {
    log.info('Retrieving Blackduck configuration')
    const blackduckService: string = tl.getInput(DetectADOConstants.BLACKDUCK_ID, true)!
    const blackduckUrl: string = tl.getEndpointUrl(blackduckService, false)!
    const blackduckToken: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_API_TOKEN, true)
    const blackduckUsername: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_USERNAME, true)
    const blackduckPassword: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants.BLACKDUCK_PASSWORD, true)

    let blackduckProxyInfo: IProxyInfo | undefined
    const blackduckProxyService: string | undefined = tl.getInput(DetectADOConstants.BLACKDUCK_PROXY_ID, false)
    if (blackduckProxyService) {
        const proxyUrl: string = tl.getEndpointUrl(blackduckProxyService, true)!
        const proxyUsername : string | undefined = tl.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants.PROXY_USERNAME, true)
        const proxyPassword: string | undefined = tl.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants.PROXY_PASSWORD, true)

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
        useProxy: (blackduckProxyInfo !== undefined),
        proxyInfo: blackduckProxyInfo
    }
}

function getDetectConfiguration(): IDetectConfiguration {
    log.info('Retrieving Detect configuration')
    const additionalArguments: string = tl.getInput(DetectADOConstants.DETECT_ARGUMENTS, false) || ""
    const detectFolder: string = tl.getInput(DetectADOConstants.DETECT_FOLDER, false) || ""
    const detectVersion: string = tl.getInput(DetectADOConstants.DETECT_VERSION, false) || "latest"

    return {
        detectAdditionalArguments: additionalArguments,
        detectFolder,
        detectVersion
    }
}

function getTaskConfiguration(): ITaskConfiguration {
    log.info('Retrieving Task configuration')
    const addTask: boolean = tl.getBoolInput(DetectADOConstants.ADD_TASK_SUMMARY, false)

    return {
        addTaskSummary: addTask
    }
}

run()
