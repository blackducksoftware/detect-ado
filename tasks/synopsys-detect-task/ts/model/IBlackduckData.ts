import {IProxyInfo} from "./IProxyInfo";

export interface IBlackduckData {
    blackduckUrl: string
    blackduckApiToken: string
    blackduckUsername: string
    blackduckPassword: string

    useProxy: boolean
    proxyInfo: IProxyInfo
}
