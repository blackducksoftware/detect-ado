import {DetectScript} from "./DetectScript";

export class PowershellDetect extends DetectScript {
    static readonly DETECT_URL = "/detect.ps1"

    getDownloadURL(): string {
        return PowershellDetect.DETECT_URL;
    }

    invokeDetect(cliFolder: string, detectArguments: string): Promise<number> {
        // TODO implement

        return Promise.resolve(0);
    }
}
