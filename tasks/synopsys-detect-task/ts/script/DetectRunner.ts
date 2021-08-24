import {IExecOptions, ToolRunner} from 'azure-pipelines-task-lib/toolrunner'
import {logger} from '../DetectLogger'
import task = require('azure-pipelines-task-lib/task')
import {IDetectScriptConfiguration} from '../model/IDetectScriptConfiguration';

export class DetectRunner {
    private readonly runnerTool: string
    private readonly runnerCommand: string
    private readonly runnerFileName: string

    private constructor(runnerTool: string, runnerCommand: string, runnerFileName: string) {
        this.runnerTool = runnerTool
        this.runnerCommand = runnerCommand
        this.runnerFileName = runnerFileName
    }

    static create(runnerTool: string, runnerCommand: string, runnerFileName: string): DetectRunner {
        return new DetectRunner(runnerTool, runnerCommand, runnerFileName)
    }

    static createFromScript(detectScriptConfiguration: IDetectScriptConfiguration) {
        return DetectRunner.create(detectScriptConfiguration.runScriptTool, detectScriptConfiguration.runScriptCommand, detectScriptConfiguration.scriptName)
    }

    getScriptName(): string {
        return this.runnerFileName
    }

    async invokeDetect(detectArguments: string, folder: string, env: any): Promise<number> {
        logger.info(`Calling detect at '${folder}'`)

        const tool: string = task.which(this.runnerTool, true)
        const toolRunner: ToolRunner = task.tool(tool)
        toolRunner.arg([this.runnerCommand, detectArguments])
        return toolRunner.exec(<IExecOptions>{
            cwd: folder,
            env
        })
    }

}
