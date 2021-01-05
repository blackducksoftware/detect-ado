import task = require('azure-pipelines-task-lib/task')
import path from 'path'
import {DetectADOConstants} from "./DetectADOConstants";

export class PathResolver {

    static getBuildSourceDirectory(): string | undefined {
        return task.getVariable('BUILD_SOURCESDIRECTORY')
    }

    static getToolDirectory(): string | undefined {
        return task.getVariable('Agent.ToolsDirectory')
    }

    static combinePathSegments(...pathSegments: string[]): string {
        return path.resolve(...pathSegments)
    }

}
