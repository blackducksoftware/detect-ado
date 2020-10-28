import {IProxyInfo} from "./IProxyInfo";

export interface IBlackduckData {
    blackduckUrl: string
    blackduckApiToken: string | undefined
    blackduckUsername: string | undefined
    blackduckPassword: string | undefined

    useProxy: boolean
    proxyInfo: IProxyInfo | undefined
}
