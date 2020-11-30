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
        const script = `.\\${PowershellDetectScript.DETECT_SCRIPT_NAME}`
        const powershell: tr.ToolRunner = tl.tool(tl.which('pwsh') || tl.which('powershell') || tl.which('pwsh', true))
        const cwd = scriptFolder

        // Script from docs "[Net.ServicePointManager]::SecurityProtocol = 'tls12'; irm https://detect.synopsys.com/detect.ps1?$(Get-Random) | iex; detect"
        const securityArg = "[Net.ServicePointManager]::SecurityProtocol = 'tls12'"
        //Runs the script 'powershell -command "& { . .\detect.ps1; Detect }"'
        const command = `& {. ${script}; Detect }`
        powershell.arg(["-command ", securityArg, command])

        return powershell.exec(<tr.IExecOptions>{
            cwd,
            env
        });
    }
}
