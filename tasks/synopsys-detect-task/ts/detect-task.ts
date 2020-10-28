import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as tl from 'azure-pipelines-task-lib/task';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import {IBlackduckData} from "./model/IBlackduckData";
import {IDetectArguments} from "./model/IDetectArguments";
import {ITaskConfiguration} from "./model/ITaskConfiguration";
import {ArgumentConstants} from "./ArgumentConstants";
import {IProxyInfo} from "./model/IProxyInfo";

const osPlat: string = os.platform();
const osArch: string = os.arch();

async function run(): Promise<number> {
    const blackduckData: IBlackduckData = getBlackduckData()
    const detectArguments: IDetectArguments = getDetectArguments()
    const taskConfiguration: ITaskConfiguration = getTaskConfiguration()

    const detectResult: number = await invokeDetect()
    return detectResult
}

async function invokeDetect(): Promise<number> {

    return null as any
}

function getBlackduckData(): IBlackduckData {
    const blackduckService: string = tl.getInput(ArgumentConstants.BLACKDUCK_ID, true)!
    const blackduckUrl: string = tl.getEndpointUrl(blackduckService, false)!
    const blackduckToken: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, ArgumentConstants.BLACKDUCK_API_TOKEN, true)
    const blackduckUsername: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, ArgumentConstants.BLACKDUCK_USERNAME, true)
    const blackduckPassword: string | undefined = tl.getEndpointAuthorizationParameter(blackduckService, ArgumentConstants.BLACKDUCK_PASSWORD, true)

    let blackduckProxyInfo: IProxyInfo | undefined
    const blackduckProxyService: string | undefined = tl.getInput(ArgumentConstants.BLACKDUCK_PROXY_ID, false)
    if (blackduckProxyService) {
        const proxyUrl: string = tl.getEndpointUrl(blackduckProxyService, true)!
        const proxyUsername : string | undefined = tl.getEndpointAuthorizationParameter(blackduckProxyService, ArgumentConstants.PROXY_USERNAME, true)
        const proxyPassword: string | undefined = tl.getEndpointAuthorizationParameter(blackduckProxyService, ArgumentConstants.PROXY_PASSWORD, true)

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

function getDetectArguments(): IDetectArguments {
    return null as any
}

function getTaskConfiguration(): ITaskConfiguration {
    return null as any
}
