import {IExecOptions, ToolRunner} from 'azure-pipelines-task-lib/toolrunner'
import {logger} from '../DetectLogger'
import task = require('azure-pipelines-task-lib/task')
import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';

export class DefaultToolRunner {
    private readonly runnerTool: string
    private readonly runnerCommand: string
    private readonly runnerFileName: string

    constructor(detectRunnerConfiguration: IDetectRunnerConfiguration) {
        this.runnerTool = detectRunnerConfiguration.runnerTool
        this.runnerCommand = detectRunnerConfiguration.runCommand
        this.runnerFileName = detectRunnerConfiguration.fileName
    }

    async invoke(args: string, folder: string, env: any): Promise<number> {
        logger.info(`Calling ${this.runnerFileName} at '${folder}'`)

        const tool: string = task.which(this.runnerTool, true)
        const toolRunner: ToolRunner = task.tool(tool)
        toolRunner.arg([this.runnerCommand, args])
        return toolRunner.exec(<IExecOptions>{
            cwd: folder,
            env
        })
    }

}
