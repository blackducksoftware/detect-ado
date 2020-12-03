import {IExecOptions, ToolRunner} from 'azure-pipelines-task-lib/toolrunner';
import {logger} from './DetectLogger';
import * as tl from 'azure-pipelines-task-lib';

export abstract class DetectScript {
    scriptName: string

    protected constructor(scriptName: string) {
        this.scriptName = scriptName
    }

    abstract getTool(): string

    abstract getCommands(): Array<string>

    getScriptName(): string {
        return this.scriptName
    }

    async invokeDetect(detectArguments: string, scriptFolder: string, env: any): Promise<number> {
        logger.info('Calling detect script')
        const tool: ToolRunner = tl.tool(this.getTool())
        tool.arg([...this.getCommands(), detectArguments])
        return tool.exec(<IExecOptions>{
            cwd: scriptFolder,
            env
        });
    }

}
