import {DetectScript} from "./DetectScript";
import * as tl from "azure-pipelines-task-lib";
import {ToolRunner} from "azure-pipelines-task-lib/toolrunner";

export class PowershellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.ps1"

    constructor() {
        super(PowershellDetectScript.DETECT_SCRIPT_NAME);
    }

    getCommands(): Array<string> {
        const script = `.\\${PowershellDetectScript.DETECT_SCRIPT_NAME}`
        const securityArg = "[Net.ServicePointManager]::SecurityProtocol = 'tls12';"
        const command = `& {. ${script}; Detect }`

        return ["-command", securityArg, command]
    }

    getTool(): ToolRunner {
        return tl.tool(tl.which('pwsh') || tl.which('powershell') || tl.which('pwsh', true))
    }
}
