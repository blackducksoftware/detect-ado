import {DetectScript} from "./DetectScript";
import * as tr from "azure-pipelines-task-lib/toolrunner";
import * as tl from "azure-pipelines-task-lib";

export class PowershellDetect extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.ps1"

    getDownloadURL(): string {
        return PowershellDetect.DETECT_SCRIPT_NAME;
    }

    async invokeDetect(cliFolder: string, env: any): Promise<number> {
        const detect: tr.ToolRunner = tl.tool(this.getDownloadURL());
        detect.line(`./${PowershellDetect.DETECT_SCRIPT_NAME}`);

        return detect.exec(<tr.IExecOptions>{
            cwd: cliFolder,
            env
        });
    }
}
