import {IBlackduckConfiguration} from './model/IBlackduckConfiguration'
import {PathResolver} from './PathResolver';
import {IProxyInfo} from "./model/IProxyInfo";

export class DetectSetup {
    private constructor() {}

    static findTaskVersion = () => { const task = require("../task.json"); return task.version.Major + "." + task.version.Minor + "." + task.version.Patch; }

    static createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration, detectVersion: string, detectDownloadPath: string): any {
        const env = process.env
        if (detectVersion && ('latest' != detectVersion)) {
            env['DETECT_LATEST_RELEASE_VERSION'] = detectVersion
        }

        env['BLACKDUCK_URL'] = blackduckConfiguration.blackduckUrl
        env['BLACKDUCK_API_TOKEN'] = blackduckConfiguration.blackduckApiToken

        const proxyInfo: IProxyInfo | undefined = blackduckConfiguration.proxyInfo
        if (proxyInfo) {
            const proxyUrl = new URL(proxyInfo.proxyUrl)
            env['blackduck.proxy.host'] = proxyUrl.hostname
            env['blackduck.proxy.port'] = proxyUrl.port
            env['blackduck.proxy.username'] = proxyInfo.proxyUsername
            env['blackduck.proxy.password'] = proxyInfo.proxyPassword
        }

        if (detectDownloadPath) {
            env['DETECT_JAR_DOWNLOAD_DIR'] = detectDownloadPath
        }
        env['DETECT_SOURCE_PATH'] = PathResolver.getBuildSourceDirectory()

        // TODO verify this works
        env['detect.phone.home.passthrough.detect.for.ado.version'] = DetectSetup.findTaskVersion()

        return env
    }

    static convertArgumentsToPassableValues(detectArguments: string): string {
        const recombinedValues = detectArguments.split('--')
            .map((value) => value.trim())
            .filter(value => value)
            .join(' --')
        return `--${recombinedValues}`
    }
}
