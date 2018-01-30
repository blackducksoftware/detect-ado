var fs = require('fs');
var path = require('path');

var vsixVersionFile = '../../tasks/detect-task/task.json';

var lib = {}

lib.tickTask = function (cb) {

    var vsixVersionJson = require(vsixVersionFile);

    vsixVersionJson.version.Patch = (parseInt(vsixVersionJson.version.Patch) + 1).toString();

    fs.writeFileSync(path.join(__dirname, vsixVersionFile), JSON.stringify(vsixVersionJson, null, 2));

    cb(null, vsixVersionJson.version.Patch);
}

module.exports = lib;
