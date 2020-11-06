"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = __importStar(require("azure-pipelines-task-lib/task"));
const os = __importStar(require("os"));
const DetectADOConstants_1 = require("./DetectADOConstants");
const PowershellDetect_1 = require("./PowershellDetect");
const BashDetect_1 = require("./BashDetect");
const osPlat = os.platform();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const blackduckConfiguration = getBlackduckConfiguration();
        const detectConfiguration = getDetectConfiguration();
        const taskConfiguration = getTaskConfiguration();
        const detectResult = yield invokeDetect(blackduckConfiguration, detectConfiguration);
        if (taskConfiguration.addTaskSummary) {
            const content = (detectResult == 0) ? "Detect ran successfully" : `There was an issue running detect, exit code: ${detectResult}`;
            // Could also be task.addattachment
            // TODO Find out how to add an attachment if this doesn't work
            tl.setTaskVariable('Distributedtask.Core.Summary', content, false);
        }
        tl.setResult(tl.TaskResult.Failed, "Not implemented", true);
    });
}
function invokeDetect(blackduckData, detectArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        let detectScript;
        if ("win32" === osPlat) {
            detectScript = new PowershellDetect_1.PowershellDetect();
        }
        else {
            detectScript = new BashDetect_1.BashDetect();
        }
        return detectScript.runScript(blackduckData, detectArguments);
    });
}
function getBlackduckConfiguration() {
    const blackduckService = tl.getInput(DetectADOConstants_1.DetectADOConstants.BLACKDUCK_ID, true);
    const blackduckUrl = tl.getEndpointUrl(blackduckService, false);
    const blackduckToken = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants_1.DetectADOConstants.BLACKDUCK_API_TOKEN, true);
    const blackduckUsername = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants_1.DetectADOConstants.BLACKDUCK_USERNAME, true);
    const blackduckPassword = tl.getEndpointAuthorizationParameter(blackduckService, DetectADOConstants_1.DetectADOConstants.BLACKDUCK_PASSWORD, true);
    let blackduckProxyInfo;
    const blackduckProxyService = tl.getInput(DetectADOConstants_1.DetectADOConstants.BLACKDUCK_PROXY_ID, false);
    if (blackduckProxyService) {
        const proxyUrl = tl.getEndpointUrl(blackduckProxyService, true);
        const proxyUsername = tl.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants_1.DetectADOConstants.PROXY_USERNAME, true);
        const proxyPassword = tl.getEndpointAuthorizationParameter(blackduckProxyService, DetectADOConstants_1.DetectADOConstants.PROXY_PASSWORD, true);
        blackduckProxyInfo = {
            proxyUrl,
            proxyUsername,
            proxyPassword
        };
    }
    return {
        blackduckUrl,
        blackduckApiToken: blackduckToken,
        blackduckUsername,
        blackduckPassword,
        useProxy: (blackduckProxyInfo !== undefined),
        proxyInfo: blackduckProxyInfo
    };
}
function getDetectConfiguration() {
    const additionalArguments = tl.getInput(DetectADOConstants_1.DetectADOConstants.DETECT_ARGUMENTS, false) || "";
    const detectFolder = tl.getInput(DetectADOConstants_1.DetectADOConstants.DETECT_FOLDER, false) || "";
    const detectVersion = tl.getInput(DetectADOConstants_1.DetectADOConstants.DETECT_VERSION, false) || "latest";
    return {
        detectAdditionalArguments: additionalArguments,
        detectFolder,
        detectVersion
    };
}
function getTaskConfiguration() {
    const addTask = tl.getBoolInput(DetectADOConstants_1.DetectADOConstants.ADD_TASK_SUMMARY, false);
    return {
        addTaskSummary: addTask
    };
}
run();
