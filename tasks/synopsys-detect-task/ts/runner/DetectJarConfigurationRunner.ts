import {IDetectRunnerConfiguration} from '../model/IDetectRunnerConfiguration';
import {DetectRunner} from './DetectRunner';

export class DetectJarConfigurationRunner extends DetectRunner {
    static readonly DETECT_JAR_NAME = 'detect.jar'

    readonly JAVA_JAR: IDetectRunnerConfiguration = {
        fileName: DetectJarConfigurationRunner.DETECT_JAR_NAME,
        runCommand: '-jar',
        runnerTool: 'java'
    }

    createRunnerConfiguration(): IDetectRunnerConfiguration {
        return this.JAVA_JAR;
    }

    async retrieveOrCreateArtifactFolder(fileName: string): Promise<string> {
        return this.detectConfiguration.detectAirGapJarPath;
    }

}
