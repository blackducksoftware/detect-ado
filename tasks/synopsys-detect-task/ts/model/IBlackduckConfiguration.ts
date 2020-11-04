import {IProxyInfo} from "./IProxyInfo";

export interface IBlackduckConfiguration {
    blackduckUrl: string
    blackduckApiToken: string | undefined
    blackduckUsername: string | undefined
    blackduckPassword: string | undefined

    useProxy: boolean
    proxyInfo: IProxyInfo | undefined
}
