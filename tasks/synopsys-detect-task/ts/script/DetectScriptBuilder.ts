import {IDetectScriptConfiguration} from "../model/IDetectScriptConfiguration";
import {logger} from "../DetectLogger";
import os from "os";

const osPlat: string = os.platform()

export abstract class DetectScriptBuilder {
    static readonly DETECT_SH_SCRIPT_NAME = 'detect.sh'
    static readonly DETECT_PS_SCRIPT_NAME = 'detect.ps1'

    static readonly BASH_SCRIPT: IDetectScriptConfiguration = {
        scriptName: DetectScriptBuilder.DETECT_SH_SCRIPT_NAME,
        runScriptCommand: `./${DetectScriptBuilder.DETECT_SH_SCRIPT_NAME}`,
        runScriptTool: 'bash'
    }

    static readonly SHELL_SCRIPT: IDetectScriptConfiguration = {
        scriptName: DetectScriptBuilder.DETECT_SH_SCRIPT_NAME,
        runScriptCommand: `./${DetectScriptBuilder.DETECT_SH_SCRIPT_NAME}`,
        runScriptTool: 'sh'
    }

    static readonly POWERSHELL_SCRIPT: IDetectScriptConfiguration = {
        scriptName: DetectScriptBuilder.DETECT_PS_SCRIPT_NAME,
        runScriptCommand: `Import-Module '.\\${DetectScriptBuilder.DETECT_PS_SCRIPT_NAME}'; Detect`,
        runScriptTool: 'powershell'
    }

    static createScriptConfiguration(): IDetectScriptConfiguration {
        if ('win32' == osPlat) {
            logger.info('Windows detected: Running powershell script')
            return this.POWERSHELL_SCRIPT
        } else if ('darwin' == osPlat) {
            logger.info('Mac detected: Running shell script')
            return this.SHELL_SCRIPT
        }

        logger.info('Linux detected: Running bash script')
        return this.BASH_SCRIPT
    }
}
