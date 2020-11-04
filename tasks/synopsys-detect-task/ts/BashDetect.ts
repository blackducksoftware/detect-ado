import {DetectScript} from "./DetectScript";
import * as tl from 'azure-pipelines-task-lib/task'
import * as tr from 'azure-pipelines-task-lib/toolrunner'

export class BashDetect extends DetectScript {
    static readonly DETECT_URL = "/detect.sh"

    getDownloadURL(): string {
        return BashDetect.DETECT_URL
    }

    async invokeDetect(cliFolder: string, detectArguments: string): Promise<number> {
        const detect: tr.ToolRunner = tl.tool(cliFolder);
        detect.line(detectArguments);

        // TODO call detect
        const return_code =  await detect.exec(<tr.IExecOptions>{

        });

        return Promise.resolve(0);
    }
}
