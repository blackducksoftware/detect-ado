import * as tl from 'azure-pipelines-task-lib/task'
import * as os from 'os'
import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration"
import {IDetectConfiguration} from "./model/IDetectConfiguration"
import {ITaskConfiguration} from "./model/ITaskConfiguration"
import {DetectADOConstants} from "./DetectADOConstants"
import {IProxyInfo} from "./model/IProxyInfo"
import {DetectScript} from "./DetectScript";
import {PowershellDetectScript} from "./PowershellDetectScript";
import {BashDetectScript} from "./BashDetectScript";

const osPlat: string = os.platform()

async function run() {
    const blackduckConfiguration: IBlackduckConfiguration = getBlackduckConfiguration()
    const detectConfiguration: IDetectConfiguration = getDetectConfiguration()
    const taskConfiguration: ITaskConfiguration = getTaskConfiguration()

    const detectResult: number = await invokeDetect(blackduckConfiguration, detectConfiguration)
    if (taskConfiguration.addTaskSummary) {
        const content = (detectResult == 0) ? "Detect ran successfully" : `There was an issue running detect, exit code: ${detectResult}`
        // Could also be task.addattachment
        // TODO Find out how to add an attachment if this doesn't work
        tl.setTaskVariable('Distributedtask.Core.Summary', content, false)
    }
    tl.setResult(tl.TaskResult.Failed, "Not implemented", true)
}

async function invokeDetect(blackduckData: IBlackduckConfiguration, detectArguments: IDetectConfiguration): Promise<number> {
    let detectScript: DetectScript
    if ("win32" === osPlat) {
        detectScript = new PowershellDetectScript()
    } else {
        detectScript = new BashDetectScript()
    }

    return detectScript.runScript(blackduckData, detectArguments)
}

function getBlackduckConfiguration(): IBlackduckConfiguration {
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
    const addTask: boolean = tl.getBoolInput(DetectADOConstants.ADD_TASK_SUMMARY, false)

    return {
        addTaskSummary: addTask
    }
}

run()
