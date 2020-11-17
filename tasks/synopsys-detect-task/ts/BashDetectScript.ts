import {DetectScript} from "./DetectScript";
import * as task from 'azure-pipelines-task-lib/task'
import * as toolRunner from 'azure-pipelines-task-lib/toolrunner'

export class BashDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.sh"

    getFilename(): string {
        return BashDetectScript.DETECT_SCRIPT_NAME
    }

    async invokeDetect(scriptFolder: string, env: any): Promise<number> {
        console.log("Setting tool runner")
        const script = `./${scriptFolder}/${BashDetectScript.DETECT_SCRIPT_NAME}`
        const sh: toolRunner.ToolRunner = task.tool(task.which('sh', true));
        sh.arg(`${script}`)
        return sh.exec(<toolRunner.IExecOptions>{
            env
        });
    }
}
