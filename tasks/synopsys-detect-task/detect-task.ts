import * as task from 'azure-pipelines-task-lib/task'
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
import fileSystem from "fs";

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

        const detectScript: DetectScript = createScript()
        const detectResult: number = await detectScript.runScript(blackduckConfiguration, detectConfiguration)
        log.info('Finished running detect, updating task information')
        if (taskConfiguration.addTaskSummary) {
            log.info('Adding task summary')
            const content = (detectResult == 0) ? "Detect ran successfully" : `There was an issue running detect, exit code: ${detectResult}`
            const tempFile: string = Date.now().toString()
            const fullPath: string = `${__dirname}/${tempFile}`
            fileSystem.writeFileSync(fullPath, content)
            task.addAttachment("Distributedtask.Core.Summary", "Synopsys Detect", fullPath)
        }
    } catch (e) {
        task.setResult(task.TaskResult.Failed, `An unexpected error occurred: ${e}`)
    }
}

function createScript(): DetectScript {
    let detectScript: DetectScript
    if ("win32" == osPlat) {
        log.info('Windows detected: Running powershell script')
        return detectScript = new PowershellDetectScript()
    }

    log.info('Windows not detected: Running shell script')
    return new BashDetectScript()
}

function getBlackduckConfiguration(): IBlackduckConfiguration {
    log.info('Retrieving Blackduck configuration')
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
        useProxy: (blackduckProxyInfo !== undefined),
        proxyInfo: blackduckProxyInfo
    }
}

function getDetectConfiguration(): IDetectConfiguration {
    log.info('Retrieving Detect configuration')
    const additionalArguments: string = task.getInput(DetectADOConstants.DETECT_ARGUMENTS, false) || ""
    const detectFolder: string = task.getInput(DetectADOConstants.DETECT_FOLDER, false) || "detect"
    const detectVersion: string = task.getInput(DetectADOConstants.DETECT_VERSION, false) || "latest"

    return {
        detectAdditionalArguments: additionalArguments,
        detectFolder,
        detectVersion
    }
}

function getTaskConfiguration(): ITaskConfiguration {
    log.info('Retrieving Task configuration')
    const addTask: boolean = task.getBoolInput(DetectADOConstants.ADD_TASK_SUMMARY, false)

    return {
        addTaskSummary: addTask
    }
}

run()
