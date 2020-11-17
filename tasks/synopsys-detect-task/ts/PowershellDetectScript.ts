import {DetectScript} from "./DetectScript";
import * as tr from "azure-pipelines-task-lib/toolrunner";
import * as tl from "azure-pipelines-task-lib";

export class PowershellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.ps1"

    getFilename(): string {
        return PowershellDetectScript.DETECT_SCRIPT_NAME;
    }

    async invokeDetect(scriptFolder: string, env: any): Promise<number> {
        console.log("Setting tool runner")
        const script = `./${PowershellDetectScript.DETECT_SCRIPT_NAME}`
        const powershell: tr.ToolRunner = tl.tool(tl.which('pwsh') || tl.which('powershell') || tl.which('pwsh', true))
        const cwd: string = scriptFolder
        powershell.arg(`${script}`)
        return powershell.exec(<tr.IExecOptions>{
            cwd,
            env
        });
    }
}
