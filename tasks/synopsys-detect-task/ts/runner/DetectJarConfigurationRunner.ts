import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {DetectRunner} from './DetectRunner';
import path, {ParsedPath} from 'path';
import {DetectSetup} from '../DetectSetup';
import {IBlackduckConfiguration} from '../model/IBlackduckConfiguration';
import {IDetectConfiguration} from '../model/IDetectConfiguration';
import fileSystem from 'fs';
import {IJarConfiguration} from '../model/IJarConfiguration';

export class DetectJarConfigurationRunner extends DetectRunner {
    private static readonly JAR_EXTENSION = '.jar'

    private jarDirectoryPath: string

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration, jarConfiguration: IJarConfiguration) {
        super(blackduckConfiguration, detectConfiguration);
        this.jarDirectoryPath = jarConfiguration.detectJarPath
    }

    createRunnerConfiguration(): IDetectRunnerConfiguration {
        const firstJarFile: string = fileSystem.readdirSync(this.jarDirectoryPath)
            .find(file => DetectJarConfigurationRunner.JAR_EXTENSION === path.parse(file).ext) || ''

        return {
            fileName: firstJarFile,
            runCommands: ['-jar', firstJarFile],
            runnerTool: 'java'
        };
    }

    async retrieveOrCreateArtifactFolder(fileName: string): Promise<string> {
        return this.jarDirectoryPath
    }
}
