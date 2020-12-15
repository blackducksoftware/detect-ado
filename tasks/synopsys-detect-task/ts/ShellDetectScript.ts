import {DetectScript} from './DetectScript'
import task = require('azure-pipelines-task-lib/task')

export class ShellDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = 'detect.sh'

    constructor() {
        super(ShellDetectScript.DETECT_SCRIPT_NAME);
    }

    getCommands(): Array<string> {
        return [`./${ShellDetectScript.DETECT_SCRIPT_NAME}`];
    }

    getTool(): string {
        return task.which('sh', true)
    }
}
