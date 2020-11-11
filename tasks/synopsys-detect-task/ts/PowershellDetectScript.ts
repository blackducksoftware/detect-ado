import {DetectScript} from "./DetectScript";
import * as tr from "azure-pipelines-task-lib/toolrunner";
import * as tl from "azure-pipelines-task-lib";

export class PowershellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.ps1"

    getFilename(): string {
        return PowershellDetectScript.DETECT_SCRIPT_NAME;
    }

    async invokeDetect(cliFolder: string, env: any): Promise<number> {
        const detect: tr.ToolRunner = tl.tool(this.getFilename());
        detect.line(`./${PowershellDetectScript.DETECT_SCRIPT_NAME}`);

        return detect.exec(<tr.IExecOptions>{
            cwd: cliFolder,
            env
        });
    }
}
