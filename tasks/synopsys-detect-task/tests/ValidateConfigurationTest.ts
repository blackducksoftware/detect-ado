import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import {Done} from "mocha";

const assert = require('assert')

describe('Sample task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function(done: Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have passed');
        done()
    });
});
