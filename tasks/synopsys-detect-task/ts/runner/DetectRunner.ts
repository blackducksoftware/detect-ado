import {DefaultToolRunner} from "./DefaultToolRunner";
import {DetectSetup} from "../DetectSetup";
import {IBlackduckConfiguration} from "../model/IBlackduckConfiguration";
import {IDetectConfiguration} from "../model/IDetectConfiguration";
import {IDetectRunnerConfiguration} from "../model/IDetectRunnerConfiguration";

export abstract class DetectRunner {
    protected readonly blackduckConfiguration: IBlackduckConfiguration
    protected readonly detectConfiguration: IDetectConfiguration

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration) {
        this.blackduckConfiguration = blackduckConfiguration;
        this.detectConfiguration = detectConfiguration;
    }

    abstract createRunnerConfiguration(): IDetectRunnerConfiguration

    abstract async retrieveOrCreateArtifactFolder(fileName: string): Promise<string>

    async invokeDetect(): Promise<number> {
        const env = DetectSetup.createEnvironmentWithVariables(this.blackduckConfiguration, this.detectConfiguration.detectVersion, this.detectConfiguration.detectFolder)
        const cleanedArguments: string[] = DetectSetup.convertArgumentsToPassableValues(this.detectConfiguration.detectAdditionalArguments)
        const config: IDetectRunnerConfiguration = this.createRunnerConfiguration()
        const artifactFolder: string = await this.retrieveOrCreateArtifactFolder(config.fileName)
        const toolRunner = new DefaultToolRunner(config)

        return await toolRunner.invoke(cleanedArguments, artifactFolder, env)
    }
}
