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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
const assert = require('assert');
describe('Sample task tests', function () {
    before(function () {
    });
    after(() => {
    });
    it('should succeed with simple inputs', function (done) {
        this.timeout(1000);
        let tp = path.join(__dirname, 'success.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have passed');
        done();
    });
});
