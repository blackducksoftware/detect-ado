import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {logger} from '../DetectLogger';
import os from 'os';
import {PathResolver} from '../PathResolver';
import {DetectADOConstants} from '../DetectADOConstants';
import {DetectScriptDownloader} from '../DetectScriptDownloader';
import {DetectRunner} from './DetectRunner';
import {DetectSetup} from '../DetectSetup';
import {IBlackduckConfiguration} from '../model/IBlackduckConfiguration';
import {IDetectConfiguration} from '../model/IDetectConfiguration';
import {IDefaultScriptConfiguration} from '../model/IDefaultScriptConfiguration';
import Axios, {AxiosInstance} from "axios";

const osPlat: string = os.platform()

export class DetectScriptConfigurationRunner extends DetectRunner {
    static readonly DETECT_SH_SCRIPT_NAME = 'detect9.sh'
    static readonly DETECT_PS_SCRIPT_NAME = 'detect9.ps1'

    readonly BASH_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME,
        runCommands: [`./${DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME}`],
        runnerTool: 'bash'
    }

    readonly SHELL_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME,
        runCommands: [`./${DetectScriptConfigurationRunner.DETECT_SH_SCRIPT_NAME}`],
        runnerTool: 'sh'
    }

    readonly POWERSHELL_SCRIPT: IDetectRunnerConfiguration = {
        fileName: DetectScriptConfigurationRunner.DETECT_PS_SCRIPT_NAME,
        runCommands: [`Import-Module '.\\${DetectScriptConfigurationRunner.DETECT_PS_SCRIPT_NAME}'; Detect`],
        runnerTool: 'powershell'
    }

    private defaultScriptConfiguration: IDefaultScriptConfiguration

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration, defaultScriptConfiguration: IDefaultScriptConfiguration) {
        super(blackduckConfiguration, detectConfiguration);
        this.defaultScriptConfiguration = defaultScriptConfiguration
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
        const workingDirectory = PathResolver.getWorkingDirectory() || ''
        const scriptFolder: string = PathResolver.combinePathSegments(workingDirectory, DetectADOConstants.SCRIPT_DETECT_FOLDER)
        let isBlackDuckAccessible: boolean = true
        const axios: AxiosInstance = Axios.create()

        try {
            logger.info("In try block")
            const bdResponse = await axios.get(DetectScriptDownloader.DETECT_DOWNLOAD_URL)

            if(bdResponse.status >= 200 && bdResponse.status <= 399) {
                logger.info("In If block")
                isBlackDuckAccessible = true;
            } else {
                logger.info("In else block")
                logger.warn("https://detect.blackduck.com responded with an unexpected status code " + bdResponse.status + ". Please allow access through your firewall as https://detect.synopsys.com will be shutdown at the end of February 2025.")
                isBlackDuckAccessible = false
            }
        } catch (error) {
            logger.warn("https://detect.blackduck.com is inaccessible from this machine. Please allow access through your firewall as https://detect.synopsys.com will be shutdown at the end of February 2025.")
            isBlackDuckAccessible = false
        }

        try {
            await DetectScriptDownloader.downloadScript(this.blackduckConfiguration.proxyInfo, fileName, scriptFolder, isBlackDuckAccessible)
        } catch (error) {
            logger.error(`Unable to connect with ${DetectScriptDownloader.DETECT_DOWNLOAD_URL}`)
            logger.error('This may be a problem with your proxy setup or network.')
            throw new Error('This may be a problem with your proxy setup or network.')
        }

        return scriptFolder
    }

    setupDetect(): DetectSetup {
        const detectSetup: DetectSetup = super.setupDetect();
        const env: any = detectSetup.getEnv()

        const detectVersion = this.defaultScriptConfiguration.detectVersion
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }

        const detectDownloadPath = this.defaultScriptConfiguration.detectFolder
        if (detectDownloadPath) {
            env['DETECT_JAR_DOWNLOAD_DIR'] = detectDownloadPath
        }

        return detectSetup
    }

}
