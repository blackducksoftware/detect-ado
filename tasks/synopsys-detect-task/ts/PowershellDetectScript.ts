import {DetectScript} from './DetectScript';
import task = require('azure-pipelines-task-lib/task')

export class PowershellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = 'detect.ps1'

    constructor() {
        super(PowershellDetectScript.DETECT_SCRIPT_NAME);
    }

    getCommands(): Array<string> {
        const script = `.\\${PowershellDetectScript.DETECT_SCRIPT_NAME}`
        const securityArg = "[Net.ServicePointManager]::SecurityProtocol = 'tls12';"
        const command = `Import-Module '${script}'; Detect`
        return [securityArg, command]
    }

    // TODO try to abstract these calls into DetectScript and pass only the name strings here
    getTool(): string {
        return task.which('pwsh') || task.which('powershell') || task.which('pwsh', true)
    }

}
