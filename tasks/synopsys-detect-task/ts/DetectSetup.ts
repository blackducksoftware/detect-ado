import {IBlackduckConfiguration} from './model/IBlackduckConfiguration'
import {PathResolver} from './PathResolver';
import {IProxyInfo} from './model/IProxyInfo';

export class DetectSetup {
    static findTaskVersion = () => { const task = require('../task.json'); return task.version.Major + '.' + task.version.Minor + '.' + task.version.Patch; }

    private blackduckConfiguration: IBlackduckConfiguration
    private detectArguments: string
    private env: any

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectArguments: string) {
        this.blackduckConfiguration = blackduckConfiguration
        this.detectArguments = detectArguments
        this.env = this.createEnvironmentWithVariables(blackduckConfiguration)
    }

    convertArgumentsToPassableValues(): string[] {
        return this.detectArguments.split('--')
            .map((value) => `--${value.trim()}`)
            .filter(value => '--' !== value)
    }

    getEnv(): any {
        return this.env
    }

    private createEnvironmentWithVariables(blackduckConfiguration: IBlackduckConfiguration): any {
        const env = process.env

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

        env['DETECT_SOURCE_PATH'] = PathResolver.getBuildSourceDirectory()

        // TODO verify this works
        env['detect.phone.home.passthrough.detect.for.ado.version'] = DetectSetup.findTaskVersion()

        return env
    }
}
