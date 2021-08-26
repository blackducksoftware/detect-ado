import {IBlackduckConfiguration} from "../ts/model/IBlackduckConfiguration";
import {DetectSetup} from "../ts/DetectSetup";
import {IDetectConfiguration} from "../ts/model/IDetectConfiguration";

const assert = require('assert')

describe('Detect setup tests', function () {

    it('validate env vars are set', function() {
        const detectKey1 = "key.1"
        const detectValue1 = "value1"
        const detectKey2 = "key.2"
        const detectValue2 = "value2"
        const actualPropertyKey = "blackduck.trust.cert"
        const actualPropertyValue = "true"
        const version = "test"
        const bd_proxy = "http://proxy.test:8080"

        const detectArgs = `--${detectKey1}=${detectValue1}
                            --${detectKey2}=${detectValue2}
                            --${actualPropertyKey}=${actualPropertyValue}`
        const config: IDetectConfiguration = {
            detectFolder: "folder",
            detectVersion: version,
            detectAdditionalArguments: detectArgs,
            useAirGap: false,
            detectAirGapJarPath: ''
        }
        const bdConfig: IBlackduckConfiguration = {
            blackduckApiToken: undefined,
            blackduckUrl: "",
            proxyInfo: {
                proxyUrl: bd_proxy,
                proxyUsername: 'proxyUsername',
                proxyPassword: 'proxypassword'
            }
        }

        const env = DetectSetup.createEnvironmentWithVariables(bdConfig, config.detectVersion, config.detectFolder)

        assert.strictEqual(env['DETECT_LATEST_RELEASE_VERSION'], version)
        assert.strictEqual(env['blackduck.proxy.host'], "proxy.test")
        assert.strictEqual(env['blackduck.proxy.port'], "8080")


    });

    it('clean detect multiline arguments', function() {
        const fakeOne = '--fake.one'
        const fakeTwo = '--fake.two'
        const fakeThree = '--fake.three'
        const fakeFour = '--fake.four'

        const args: string = `${fakeOne} ${fakeTwo}
        ${fakeThree}
        ${fakeFour}`

        const cleanedValues: string[] = DetectSetup.convertArgumentsToPassableValues(args)

        assert.strictEqual(4, cleanedValues.length)

        assert.strictEqual(fakeOne, cleanedValues[0])
        assert.strictEqual(fakeTwo, cleanedValues[1])
        assert.strictEqual(fakeThree, cleanedValues[2])
        assert.strictEqual(fakeFour, cleanedValues[3])
    });

    it('clean detect arguments', function() {
        const fakeOne = '--fake.one'
        const fakeTwo = '--fake.two'

        const args: string = `${fakeOne} ${fakeTwo}`

        const cleanedValues = DetectSetup.convertArgumentsToPassableValues(args)

        assert.strictEqual(2, cleanedValues.length)

        assert.strictEqual(fakeOne, cleanedValues[0])
        assert.strictEqual(fakeTwo, cleanedValues[1])
    });

})
