import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
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

    createEnvironmentWithVariables(detectArguments: string): any {
        const env = process.env
        parseArguments(detectArguments).forEach((value, key) => {
            const formattedKey = key.replace('.', '_').toUpperCase()
            env[formattedKey] = value
        })
        return env
    }

    getFullDownloadUrl(): string {
        return `${DetectScript.DETECT_DOWNLOAD_URL}/${this.getFilename()}`
    }

    // TODO Add the specified detect version that should be downloaded
    async downloadScript(axios: AxiosInstance, folder: string) {
        if (fileSystem.existsSync(folder)) {
            console.log('Cleaning existing folder')
            // Clean out existing folder
            fileSystemExtra.removeSync(folder);
        }

        console.log(`Creating folder '${folder}'`)
        fileSystem.mkdirSync(folder, {recursive: true})
        const downloadLink: string = this.getFullDownloadUrl()
        const writer: WriteStream = fileSystem.createWriteStream(`${folder}/${this.getFilename()}`);
        const response = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)
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

    runScript(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration): Promise<number> {
        const axiosAgent: AxiosInstance = this.createAxiosAgent(blackduckConfiguration)
        console.log("Downloading detect script.")
        this.downloadScript(axiosAgent, detectConfiguration.detectFolder)
        const env = this.createEnvironmentWithVariables(detectConfiguration.detectAdditionalArguments)
        console.log("Calling detect script")
        return this.invokeDetect(detectConfiguration.detectFolder, env)
    }

}
