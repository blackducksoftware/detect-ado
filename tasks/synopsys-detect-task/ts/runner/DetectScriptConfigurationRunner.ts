import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {logger} from '../DetectLogger';
import os from 'os';
import {PathResolver} from '../PathResolver';
import {DetectADOConstants} from '../DetectADOConstants';
import {DetectScriptDownloader} from '../DetectScriptDownloader';
import {DetectRunner} from './DetectRunner';

const osPlat: string = os.platform()

export class DetectScriptConfigurationRunner extends DetectRunner {
    static readonly DETECT_SH_SCRIPT_NAME = 'detect7.sh'
    static readonly DETECT_PS_SCRIPT_NAME = 'detect7.ps1'

    readonly BASH_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME,
        runCommand: `./${DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME}`,
        runnerTool: 'bash'
    }

    readonly SHELL_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME,
        runCommand: `./${DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME}`,
        runnerTool: 'sh'
    }

    readonly POWERSHELL_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_PS_SCRIPT_NAME,
        runCommand: `Import-Module '.\\${DetectScriptConfigurationRunner.DETECT_PS_SCRIPT_NAME}'; Detect`,
        runnerTool: 'powershell'
    }

    createRunnerConfiguration(): IDetectRunnerConfiguration {
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

    async retrieveOrCreateArtifactFolder(fileName: string): Promise<string> {
        const workingDirectory = PathResolver.getWorkingDirectory() || ""
        const scriptFolder: string = PathResolver.combinePathSegments(workingDirectory, DetectADOConstants.SCRIPT_DETECT_FOLDER)

        try {
            await DetectScriptDownloader.downloadScript(this.blackduckConfiguration.proxyInfo, fileName, scriptFolder)
        } catch (error) {
            logger.error(`Unable to connect with ${DetectScriptDownloader.DETECT_DOWNLOAD_URL}`)
            logger.error('This may be a problem with your proxy setup or network.')
        }

        return scriptFolder
    }

}
