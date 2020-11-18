import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
import * as task from 'azure-pipelines-task-lib/task'
import Axios, {AxiosInstance} from "axios";
import {IProxyInfo} from "./model/IProxyInfo";
import url from "url";
import HttpsProxyAgent from "https-proxy-agent/dist/agent";
import fileSystem, {WriteStream} from "fs";
import {IDetectConfiguration} from "./model/IDetectConfiguration";
import {parseArguments} from "./DetectUtils"

const fileSystemExtra = require("fs-extra")

export abstract class DetectScript {
    static readonly DETECT_DOWNLOAD_URL = "https://detect.synopsys.com"

    abstract getFilename(): string

    async abstract invokeDetect(scriptFolder: string, env: any): Promise<number>

    createEnvironmentWithVariables(detectConfiguration: IDetectConfiguration): any {
        const env = process.env
        const detectArguments: string = detectConfiguration.detectAdditionalArguments
        parseArguments(detectArguments).forEach((value, key) => {
            const formattedKey = key.replace('.', '_').toUpperCase()
            env[formattedKey] = value
        })
        const detectVersion: string = detectConfiguration.detectVersion
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }
        env['DETECT_EXIT_CODE_PASSTHRU'] = "1"
        env['DETECT_JAR_PATH'] = detectConfiguration.detectFolder
        env['DETECT_SOURCE_PATH'] = task.getVariable('BUILD_SOURCESDIRECTORY')
        return env
    }

    getFullDownloadUrl(): string {
        return `${DetectScript.DETECT_DOWNLOAD_URL}/${this.getFilename()}`
    }

    async downloadScript(axios: AxiosInstance, folder: string): Promise<boolean> {
        if (fileSystem.existsSync(folder)) {
            console.log('Cleaning existing folder')
            // Clean out existing folder
            fileSystemExtra.removeSync(folder);
        }

        console.log(`Creating folder '${folder}'`)
        fileSystem.mkdirSync(folder, {recursive: true})
        const downloadLink: string = this.getFullDownloadUrl()
        const filePath: string = `${folder}/${this.getFilename()}`
        const writer: WriteStream = fileSystem.createWriteStream(filePath);
        const response = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)
        return fileSystem.existsSync(filePath)
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

    async runScript(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): Promise<number> {
        const axiosAgent: AxiosInstance = this.createAxiosAgent(blackduckConfiguration)
        console.log("Downloading detect script.")
        const scriptDownloaded: boolean = await this.downloadScript(axiosAgent, detectConfiguration.detectFolder)
        if (!scriptDownloaded) {
            console.log("Didn't download file")
        } else {
            console.log("Downloaded file")
        }
        const env = this.createEnvironmentWithVariables(detectConfiguration)
        console.log("Calling detect script")
        return await this.invokeDetect(detectConfiguration.detectFolder, env)
    }

}
