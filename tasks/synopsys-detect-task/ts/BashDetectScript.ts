import {DetectScript} from './DetectScript'
import task = require('azure-pipelines-task-lib/task')

export class BashDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = 'detect.sh'

    constructor() {
        super(BashDetectScript.DETECT_SCRIPT_NAME);
    }

    getCommands(): Array<string> {
        return [`./${BashDetectScript.DETECT_SCRIPT_NAME}`];
    }

    getTool(): string {
        return task.which('sh', true)
    }
}
