import task = require('azure-pipelines-task-lib/task')
import path from 'path'

export class PathResolver {

    static getBuildSourceDirectory(): string {
        return task.getVariable('BUILD_SOURCESDIRECTORY') || __dirname
    }

    static getToolDirectory(): string {
        return task.getVariable('Agent.ToolsDirectory') || __dirname
    }

    static getWorkingDirectory(): string {
        return task.getVariable('Agent.WorkFolder') || __dirname
    }

    static combinePathSegments(...pathSegments: string[]): string {
        return path.resolve(...pathSegments)
    }

}
