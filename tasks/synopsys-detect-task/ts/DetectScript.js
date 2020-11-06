"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectScript = void 0;
const axios_1 = __importDefault(require("axios"));
const url_1 = __importDefault(require("url"));
const agent_1 = __importDefault(require("https-proxy-agent/dist/agent"));
const fs_1 = __importDefault(require("fs"));
const fse = require("fs-extra");
const FileDownload = require("js-file-download");
const DetectUtils_1 = require("./DetectUtils");
class DetectScript {
    createEnvironmentWithVariables(detectArguments) {
        const env = process.env;
        DetectUtils_1.parseArguments(detectArguments).forEach((value, key) => {
            env[key] = value;
        });
        return env;
    }
    getFullDownloadUrl() {
        return `${DetectScript.DETECT_DOWNLOAD_URL}/${this.getDownloadURL()}`;
    }
    downloadScript(axios, folder) {
        if (fs_1.default.existsSync(folder)) {
            // Clean out existing folder
            fse.removeSync(folder);
        }
        const downloadLink = this.getFullDownloadUrl();
        axios.get(downloadLink).then((response) => {
            FileDownload(response.data, `${folder} + ${this.getDownloadURL()}`);
        });
    }
    createAxiosAgent(blackduckData) {
        if (blackduckData.useProxy) {
            const proxyInfo = blackduckData.proxyInfo;
            const proxyOpts = url_1.default.parse(proxyInfo.proxyUrl);
            const proxyConfig = {
                host: proxyOpts.hostname,
                port: proxyOpts.port
            };
            if (proxyInfo.proxyUsername && proxyInfo.proxyPassword) {
                proxyConfig.auth = proxyInfo.proxyUsername + ":" + proxyInfo.proxyPassword;
            }
            const httpsAgent = new agent_1.default(proxyConfig);
            return axios_1.default.create({ httpsAgent });
        }
        return axios_1.default.create();
    }
    runScript(blackduckConfiguration, detectConfiguration) {
        return __awaiter(this, void 0, void 0, function* () {
            const axiosAgent = this.createAxiosAgent(blackduckConfiguration);
            this.downloadScript(axiosAgent, detectConfiguration.detectFolder);
            const env = this.createEnvironmentWithVariables(detectConfiguration.detectAdditionalArguments);
            return yield this.invokeDetect(detectConfiguration.detectFolder, env);
        });
    }
}
exports.DetectScript = DetectScript;
DetectScript.DETECT_DOWNLOAD_URL = "https://detect.synopsys.com";
