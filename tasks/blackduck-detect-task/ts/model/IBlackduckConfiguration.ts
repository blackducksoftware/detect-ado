import {IProxyInfo} from './IProxyInfo';

export interface IBlackduckConfiguration {
    blackduckUrl: string
    blackduckApiToken: string | undefined

    proxyInfo: IProxyInfo | undefined
}
