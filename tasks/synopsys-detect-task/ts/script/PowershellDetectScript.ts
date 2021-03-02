import {DetectScript} from './DetectScript';
import task = require('azure-pipelines-task-lib/task')
import {PathResolver} from "../PathResolver";

export class PowershellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = 'detect.ps1'

    constructor() {
        super(PowershellDetectScript.DETECT_SCRIPT_NAME);
    }

    getCommands(scriptFolder: string): Array<string> {
        const script = PathResolver.combinePathSegments(scriptFolder, PowershellDetectScript.DETECT_SCRIPT_NAME)
        const command = `Import-Module '${script}'; Detect`
        return [command]
    }

    getTool(): string {
        return task.which('powershell', true)
    }

}
