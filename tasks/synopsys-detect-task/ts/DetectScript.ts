import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
import * as task from 'azure-pipelines-task-lib/task'
import Axios, {AxiosInstance} from "axios";
import {IProxyInfo} from "./model/IProxyInfo";
import url from "url";
import HttpsProxyAgent from "https-proxy-agent/dist/agent";
import fileSystem, {WriteStream} from "fs";
import {IDetectConfiguration} from "./model/IDetectConfiguration";
import {parseArguments} from "./DetectUtils"
import {IExecOptions, ToolRunner} from "azure-pipelines-task-lib/toolrunner";
import {logger} from "./DetectLogger";

const fileSystemExtra = require("fs-extra")

export abstract class DetectScript {
    static readonly DETECT_DOWNLOAD_URL = "https://detect.synopsys.com"
    scriptName: string

    protected constructor(scriptName: string) {
        this.scriptName = scriptName
    }

    abstract getTool(): ToolRunner

    abstract getCommands(): Array<string>

    getScriptName(): string {
        return this.scriptName
    }

    async runScript(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): Promise<number> {
        const axiosAgent: AxiosInstance = this.createAxiosAgent(blackduckConfiguration)
        await this.downloadScript(axiosAgent, detectConfiguration.detectFolder)
        const env = this.createEnvironmentWithVariables(blackduckConfiguration, detectConfiguration)
        return await this.invokeDetect(detectConfiguration.detectFolder, env)
    }

    createAxiosAgent(blackduckData: IBlackduckConfiguration): AxiosInstance {
        if (blackduckData.useProxy) {
            const proxyInfo: IProxyInfo = blackduckData.proxyInfo!
            const proxyOpts = url.parse(proxyInfo.proxyUrl)

            const proxyConfig: any = {
                host: proxyOpts.hostname,
                port: proxyOpts.port
            }

            if (proxyInfo.proxyUsername && proxyInfo.proxyPassword) {
                proxyConfig.auth = proxyInfo.proxyUsername + ":" + proxyInfo.proxyPassword
            }

            const httpsAgent = new HttpsProxyAgent(proxyConfig)
            return Axios.create({httpsAgent})
        }

        return Axios.create()
    }

    async downloadScript(axios: AxiosInstance, folder: string): Promise<boolean> {
        logger.info("Downloading detect script.")
        if (fileSystem.existsSync(folder)) {
            logger.info('Cleaning existing folder')
            // Clean out existing folder
            fileSystemExtra.removeSync(folder);
        }

        fileSystem.mkdirSync(folder, {recursive: true})
        const downloadLink: string = this.getFullDownloadUrl()
        const filePath: string = `${folder}/${this.getScriptName()}`
        const writer: WriteStream = fileSystem.createWriteStream(filePath);
        const response = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    }

    getFullDownloadUrl(): string {
        return `${DetectScript.DETECT_DOWNLOAD_URL}/${this.getScriptName()}`
    }

    createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): any {
        const env = process.env
        const detectArguments: string = detectConfiguration.detectAdditionalArguments
        parseArguments(detectArguments).forEach((value, key) => {
            // Replaces all occurrences of . with _ (Need to use regex otherwise only the first is replaced)
            const formattedKey = key.replace(new RegExp("\\.", "g"), '_').toUpperCase()
            env[formattedKey] = value
        })
        const detectVersion: string = detectConfiguration.detectVersion
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }

        env['BLACKDUCK_URL'] = blackduckConfiguration.blackduckUrl

        if(blackduckConfiguration.blackduckApiToken) {
            logger.info("Using blackduck API token")
            env['BLACKDUCK_API_TOKEN'] = blackduckConfiguration.blackduckApiToken
        } else {
            logger.info("Using blackduck username and password")
            env['BLACKDUCK_USERNAME'] = blackduckConfiguration.blackduckUsername
            env['BLACKDUCK_PASSWORD'] = blackduckConfiguration.blackduckPassword
        }

        // Set according to the Powershell script
        env['DETECT_EXIT_CODE_PASSTHRU'] = "1"

        env['DETECT_SOURCE_PATH'] = task.getVariable('BUILD_SOURCESDIRECTORY')

        return env
    }

    async invokeDetect(scriptFolder: string, env: any): Promise<number> {
        logger.info("Calling detect script")
        logger.info("Setting tool runner")
        const tool: ToolRunner = this.getTool()
        tool.arg(this.getCommands())
        return tool.exec(<IExecOptions>{
            cwd: scriptFolder,
            env
        });
    }

}
