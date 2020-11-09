import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
import Axios, {AxiosInstance} from "axios";
import {IProxyInfo} from "./model/IProxyInfo";
import url from "url";
import HttpsProxyAgent from "https-proxy-agent/dist/agent";
import fs from "fs";
const fse = require("fs-extra")
import {IDetectConfiguration} from "./model/IDetectConfiguration";
import {parseArguments} from "./DetectUtils"

export abstract class DetectScript {
    static readonly DETECT_DOWNLOAD_URL = "https://detect.synopsys.com"

    abstract getDownloadURL(): string

    async abstract invokeDetect(cliFolder: string, env: any): Promise<number>

    createEnvironmentWithVariables(detectArguments: string): any {
        const env = process.env
        parseArguments(detectArguments).forEach((value, key) => {
            const formattedKey = key.replace('.', '_').toUpperCase()
            env[formattedKey] = value
        })
        return env
    }

    getFullDownloadUrl(): string {
        return `${DetectScript.DETECT_DOWNLOAD_URL}/${this.getDownloadURL()}`
    }

    downloadScript(axios: AxiosInstance, folder: string): void {
        if (fs.existsSync(folder)) {
            // Clean out existing folder
            fse.removeSync(folder);
        }

        fs.mkdirSync(folder)
        const downloadLink: string = this.getFullDownloadUrl()
        const writer = fs.createWriteStream(`${folder}/${this.getDownloadURL()}`);
        axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
        }).then((response) => {
            response.data.pipe(writer)
        })
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
        this.downloadScript(axiosAgent, detectConfiguration.detectFolder)
        const env = this.createEnvironmentWithVariables(detectConfiguration.detectAdditionalArguments)
        return await this.invokeDetect(detectConfiguration.detectFolder, env)
    }

}
