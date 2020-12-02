import {DetectScript} from "./DetectScript";
import * as task from 'azure-pipelines-task-lib'

export class BashDetectScript extends DetectScript {
    static readonly DETECT_SCRIPT_NAME = "detect.sh"

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
