import {DetectRunner} from './script/DetectRunner';
import fileSystem from 'fs';
import {PathResolver} from './PathResolver';

// TODO this could be converted to a "DetectScriptConfiguration" and ran
export class DetectAirGapMode {
    private readonly DETECT_JAR_NAME = 'detect.jar'
    private readonly detectJarPath: string
    private readonly detectArguments: string

    constructor(detectJarPath: string, detectArguments: string) {
        this.detectJarPath = detectJarPath
        this.detectArguments = detectArguments
    }

    containsNecessaryFiles(): boolean {
        const jarFile: string = PathResolver.combinePathSegments(this.detectJarPath, this.DETECT_JAR_NAME)
        return fileSystem.existsSync(jarFile)
    }

    invokeDetect(env: any): Promise<number> {
        const detectRunner = DetectRunner.create('java', '-jar', this.DETECT_JAR_NAME)
        return detectRunner.invokeDetect(this.detectArguments, this.detectJarPath, env)
    }
}
