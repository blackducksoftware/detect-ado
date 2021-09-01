import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {DetectRunner} from './DetectRunner';
import path from 'path';
import {IBlackduckConfiguration} from '../model/IBlackduckConfiguration';
import {IDetectConfiguration} from '../model/IDetectConfiguration';
import fileSystem from 'fs';
import {IJarConfiguration} from '../model/IJarConfiguration';
import {logger} from '../DetectLogger';

export class DetectJarConfigurationRunner extends DetectRunner {
    private static readonly JAR_PREFIX = 'synopsys-detect-'
    private static readonly JAR_EXTENSION = '.jar'

    private readonly jarDirectoryPath: string

    constructor(blackduckConfiguration: IBlackduckConfiguration, detectConfiguration: IDetectConfiguration, jarConfiguration: IJarConfiguration) {
        super(blackduckConfiguration, detectConfiguration);
        this.jarDirectoryPath = jarConfiguration.detectJarPath
    }

    createRunnerConfiguration(): IDetectRunnerConfiguration {
        const firstJarFile: string = fileSystem.readdirSync(this.jarDirectoryPath)
            .find(file => DetectJarConfigurationRunner.JAR_EXTENSION === path.parse(file).ext) || ''

        if (!firstJarFile || !firstJarFile.startsWith(DetectJarConfigurationRunner.JAR_PREFIX)) {
            logger.warn('Should have only the detect jar in this directory.')
            logger.error(`Was unable to find valid jar in ${this.jarDirectoryPath}.`)

            return {
                fileName: '',
                runCommands: [],
                runnerTool: ''
            }
        } else {
            logger.info(`Found jar file '${firstJarFile}'`)
        }

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
