import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {DetectRunner} from './DetectRunner';
import path, {ParsedPath} from 'path';

export class DetectJarConfigurationRunner extends DetectRunner {
    createRunnerConfiguration(): IDetectRunnerConfiguration {
        const parsedPath: ParsedPath = path.parse(this.detectConfiguration.detectAirGapJarPath)
        return {
            fileName: parsedPath.base,
            runCommands: ['-jar', parsedPath.base],
            runnerTool: 'java'
        };
    }

    async retrieveOrCreateArtifactFolder(fileName: string): Promise<string> {
        const parsedPath: ParsedPath = path.parse(this.detectConfiguration.detectAirGapJarPath)
        return parsedPath.dir
    }

}
