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
exports.PowershellDetect = void 0;
const DetectScript_1 = require("./DetectScript");
const tl = __importStar(require("azure-pipelines-task-lib"));
class PowershellDetect extends DetectScript_1.DetectScript {
    getDownloadURL() {
        return PowershellDetect.DETECT_SCRIPT_NAME;
    }
    invokeDetect(cliFolder, env) {
        return __awaiter(this, void 0, void 0, function* () {
            const detect = tl.tool(this.getDownloadURL());
            detect.line(`./${PowershellDetect.DETECT_SCRIPT_NAME}`);
            return detect.exec({
                cwd: cliFolder,
                env
            });
        });
    }
}
exports.PowershellDetect = PowershellDetect;
PowershellDetect.DETECT_SCRIPT_NAME = "detect.ps1";
