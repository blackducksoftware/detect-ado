import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as tl from 'azure-pipelines-task-lib/task';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import {IBlackduckData} from "./model/IBlackduckData";
import {IDetectArguments} from "./model/IDetectArguments";
import {ITaskConfiguration} from "./model/ITaskConfiguration";

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
    return null as any
}

function getDetectArguments(): IDetectArguments {
    return null as any
}

function getTaskConfiguration(): ITaskConfiguration {
    return null as any
}
