import Axios, {AxiosInstance} from 'axios';
import {IProxyInfo} from './model/IProxyInfo';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import {logger} from './DetectLogger';
import fileSystem, {WriteStream} from 'fs';
import {PathResolver} from './PathResolver';

export class DetectScriptDownloader {
    static readonly DETECT_DOWNLOAD_URL = 'https://detect.blackduck.com'

    private constructor() {}

    static async downloadScript(proxyInfo: IProxyInfo | undefined, scriptName: string, scriptDirectory: string): Promise<boolean> {
        logger.info('Downloading detect script.')
        if (!fileSystem.existsSync(scriptDirectory)) {
            fileSystem.mkdirSync(scriptDirectory, {recursive: true})
        }

        const downloadLink: string = this.getFullDownloadUrl(scriptName)
        const filePath: string = PathResolver.combinePathSegments(scriptDirectory, scriptName)
        const writer: WriteStream = fileSystem.createWriteStream(filePath);
        const axios: AxiosInstance = this.createAxiosAgent(proxyInfo)
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

    // TODO check for support of NTLM, Basic, Digest
    private static createAxiosAgent(proxyInfo: IProxyInfo | undefined): AxiosInstance {
        if (proxyInfo) {
            const proxyOpts = url.parse(proxyInfo.proxyUrl)

            const proxyConfig: any = {
                host: proxyOpts.hostname,
                port: proxyOpts.port
            }

            if (proxyInfo.proxyUsername && proxyInfo.proxyPassword) {
                proxyConfig.auth = proxyInfo.proxyUsername + ':' + proxyInfo.proxyPassword
            }

            const httpsAgent = new HttpsProxyAgent(proxyConfig)
            return Axios.create({httpsAgent})
        }

        return Axios.create()
    }

    private static getFullDownloadUrl(scriptName: string): string {
        return `${DetectScriptDownloader.DETECT_DOWNLOAD_URL}/${scriptName}`
    }
}
