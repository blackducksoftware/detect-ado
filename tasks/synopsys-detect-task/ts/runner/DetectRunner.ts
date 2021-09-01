import {ADOToolRunner} from './ADOToolRunner';
import {DetectSetup} from '../DetectSetup';
import {IBlackduckConfiguration} from '../model/IBlackduckConfiguration';
import {IDetectConfiguration} from '../model/IDetectConfiguration';
import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';

export abstract class DetectRunner {
    protected readonly blackduckConfiguration: IBlackduckConfiguration
    protected readonly detectConfiguration: IDetectConfiguration

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration) {
        this.blackduckConfiguration = blackduckConfiguration;
        this.detectConfiguration = detectConfiguration;
    }

    abstract createRunnerConfiguration(): IDetectRunnerConfiguration

    abstract async retrieveOrCreateArtifactFolder(fileName: string): Promise<string>

    setupDetect(): DetectSetup {
        return new DetectSetup(this.blackduckConfiguration, this.detectConfiguration.detectAdditionalArguments)
    }

    async invokeDetect(): Promise<number> {
        const detectSetup = this.setupDetect()
        const env = detectSetup.getEnv()
        const cleanedArguments: string[] = detectSetup.convertArgumentsToPassableValues()
        const config: IDetectRunnerConfiguration = this.createRunnerConfiguration()
        const artifactFolder: string = await this.retrieveOrCreateArtifactFolder(config.fileName)
        const toolRunner = new ADOToolRunner(config)

        return await toolRunner.invoke(cleanedArguments, artifactFolder, env)
    }
}
