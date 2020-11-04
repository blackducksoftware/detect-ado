import {IBlackduckConfiguration} from "./model/IBlackduckConfiguration";
import Axios, {AxiosInstance} from "axios";
import {IProxyInfo} from "./model/IProxyInfo";
import url from "url";
import HttpsProxyAgent from "https-proxy-agent/dist/agent";
import fs from "fs";
const fse = require("fs-extra")
import {IDetectConfiguration} from "./model/IDetectConfiguration";

export abstract class DetectScript {
    static readonly DETECT_DOWNLOAD_URL = "https://detect.synopsys.com"

    abstract getDownloadURL(): string

    async abstract invokeDetect(cliFolder: string, detectArguments: string): Promise<number>

    // Why is this returning a promise?
    async downloadScript(axios: any, folder: string): Promise<any> {
        if (fs.existsSync(folder)) {
            // Clean out existing folder
            fse.removeSync(folder);
        }

        const downloadLink: string = DetectScript.DETECT_DOWNLOAD_URL + this.getDownloadURL()

        const writer = fs.createWriteStream(folder + this.getDownloadURL());

        // Find out an easier way to write to a file
        const response = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
        });


        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject)
        });
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

    async runScript(blackduckData: IBlackduckConfiguration, detectSettings: IDetectConfiguration): Promise<number> {
        const axiosAgent: AxiosInstance = this.createAxiosAgent(blackduckData)
        // Should I be using folder/file?
        const result = await this.downloadScript(axiosAgent, detectSettings.detectFolder)
        return await this.invokeDetect(detectSettings.detectFolder, detectSettings.detectAdditionalArguments)
    }

}
