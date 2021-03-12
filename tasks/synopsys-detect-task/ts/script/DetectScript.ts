import {IExecOptions, ToolRunner} from 'azure-pipelines-task-lib/toolrunner'
import {logger} from '../DetectLogger'
import task = require('azure-pipelines-task-lib/task')
import {IDetectScriptConfiguration} from "../model/IDetectScriptConfiguration";

export class DetectScript {
    detectScriptConfiguration: IDetectScriptConfiguration

    constructor(detectScriptConfiguration: IDetectScriptConfiguration) {
        this.detectScriptConfiguration = detectScriptConfiguration
    }

    getScriptName(): string {
        return this.detectScriptConfiguration.scriptName
    }

    async invokeDetect(detectArguments: string, scriptFolder: string, env: any): Promise<number> {
        logger.info(`Calling detect script at '${scriptFolder}'`)

        const tool: string = task.which(this.detectScriptConfiguration.runScriptTool, true)
        const toolRunner: ToolRunner = task.tool(tool)
        toolRunner.arg([this.detectScriptConfiguration.runScriptCommand, detectArguments])
        return toolRunner.exec(<IExecOptions>{
            cwd: scriptFolder,
            env
        })
    }

}
