import {DetectScript} from "./DetectScript";
import * as tl from 'azure-pipelines-task-lib/task'
import * as tr from 'azure-pipelines-task-lib/toolrunner'

export class BashDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.sh"

    getFilename(): string {
        return BashDetectScript.DETECT_SCRIPT_NAME
    }

    async invokeDetect(scriptFolder: string, env: any): Promise<number> {
        console.log("Setting tool runner")
        const script = `${scriptFolder}/${BashDetectScript.DETECT_SCRIPT_NAME}`
        const sh: tr.ToolRunner = tl.tool(tl.which('sh', true));
        const cwd: string = scriptFolder
        console.log('script:' + scriptFolder)
        sh.arg(`${script}`)
        return sh.exec(<tr.IExecOptions>{
            cwd,
            env
        });
    }
}
