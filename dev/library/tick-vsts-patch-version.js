var fs = require('fs');
var path = require('path');

var vsixVersionFile = '../../vsts-extension.json';

var lib = {}

lib.tickVsts = function (cb) {

    var vsixVersionJson = require(vsixVersionFile);

    var parts = vsixVersionJson.version.split(".");
    parts[2] = (parseInt(parts[2]) + 1).toString();
    vsixVersionJson.version = parts.join(".");

    fs.writeFileSync(path.join(__dirname, vsixVersionFile), JSON.stringify(vsixVersionJson, null, 2));

    cb(null, vsixVersionJson.version);

}
module.exports = lib;
