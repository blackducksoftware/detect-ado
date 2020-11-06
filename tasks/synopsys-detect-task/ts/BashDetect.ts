import {DetectScript} from "./DetectScript";
import * as tl from 'azure-pipelines-task-lib/task'
import * as tr from 'azure-pipelines-task-lib/toolrunner'

export class BashDetect extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.sh"

    getDownloadURL(): string {
        return BashDetect.DETECT_SCRIPT_NAME
    }

    async invokeDetect(cliFolder: string, env: any): Promise<number> {
        const detect: tr.ToolRunner = tl.tool(this.getDownloadURL());
        detect.line(`./${BashDetect.DETECT_SCRIPT_NAME}`);

        return detect.exec(<tr.IExecOptions>{
            cwd: cliFolder,
            env
        });
    }
}
