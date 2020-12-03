import Axios, {AxiosInstance} from 'axios';
import {IProxyInfo} from './model/IProxyInfo';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import {logger} from './DetectLogger';
import fileSystem, {WriteStream} from 'fs';

const fileSystemExtra = require('fs-extra')

export class DetectScriptDownloader {
    static readonly DETECT_DOWNLOAD_URL = 'https://detect.synopsys.com'

    // TODO check for support of NTLM, Basic, Digest
    createAxiosAgent(proxyInfo: IProxyInfo | undefined): AxiosInstance {
        if (proxyInfo) {
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

    async downloadScript(proxyInfo: IProxyInfo | undefined, scriptName: string, folder: string): Promise<boolean> {
        logger.info('Downloading detect script.')
        if (fileSystem.existsSync(folder)) {
            logger.info('Cleaning existing folder')
            // Clean out existing folder
            fileSystemExtra.removeSync(folder);
        }

        fileSystem.mkdirSync(folder, {recursive: true})
        const downloadLink: string = this.getFullDownloadUrl(scriptName)
        const filePath: string = `${folder}/${scriptName}`
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

    getFullDownloadUrl(scriptName: string): string {
        return `${DetectScriptDownloader.DETECT_DOWNLOAD_URL}/${scriptName}`
    }
}
