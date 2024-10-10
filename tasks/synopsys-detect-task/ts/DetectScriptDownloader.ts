import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {IProxyInfo} from './model/IProxyInfo';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import {logger} from './DetectLogger';
import fileSystem, {WriteStream} from 'fs';
import {PathResolver} from './PathResolver';

export class DetectScriptDownloader {
    static readonly DETECT_DOWNLOAD_URL = 'https://detect.blackduck.com'
    static readonly DETECT_DOWNLOAD_FALLBACK_URL = 'https://detect.synopsys.com'
    private static downloadLink: string;

    private constructor() {}

    static async downloadScript(proxyInfo: IProxyInfo | undefined, scriptName: string, scriptDirectory: string): Promise<boolean> {
        logger.info('Downloading detect script.')
        if (!fileSystem.existsSync(scriptDirectory)) {
            fileSystem.mkdirSync(scriptDirectory, {recursive: true})
        }

        const filePath: string = PathResolver.combinePathSegments(scriptDirectory, scriptName)
        const writer: WriteStream = fileSystem.createWriteStream(filePath)
        const axios: AxiosInstance = this.createAxiosAgent(proxyInfo)

        try {
            await this.isBlackDuckURLAccessible(axios, writer)
            this.downloadLink = this.getFullDownloadUrl(scriptName);
        } catch (error) {
            this.downloadLink = this.getFullFallbackDownloadUrl(scriptName);
        }

        const response = await axios({
            url: this.downloadLink,
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

    private static getFullFallbackDownloadUrl(scriptName: string): string {
        return `${DetectScriptDownloader.DETECT_DOWNLOAD_FALLBACK_URL}/${scriptName}`
    }

    private static async isBlackDuckURLAccessible(axios: AxiosInstance, writer: WriteStream): Promise<boolean> {

        const response: AxiosResponse<any> = await axios({
            url: DetectScriptDownloader.DETECT_DOWNLOAD_URL,
            method: 'GET',
        }).catch(function()  {
            logger.warn("https://repo.blackduck.com is inaccessible from this machine. Please allow access through your firewall as https://sig-repo.synopsys.com will be shutdown at the end of February 2025.")
            return new Promise((reject) => {
                writer.on('error', reject)
            })
        })

        if(response.status >= 200 && response.status <= 399) {
            return new Promise((resolve) => {
                writer.on('finish', resolve)
            })
        } else {
            logger.warn("https://repo.blackduck.com responded with an unexpected status code " + response.status + ". Please allow access through your firewall as https://sig-repo.synopsys.com will be shutdown at the end of February 2025.")
            return new Promise((reject) => {
                writer.on('error', reject)
            })
        }
    }
}
