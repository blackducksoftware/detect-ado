var fs = require('fs');
var path = require('path');

var vsixVersionFile = '../../tasks/detect-task/task.json';
var taskFile = '../../tasks/detect-task/detect-task.ps1';

var lib = {}

lib.updateEmbeddedVersion = function (cb) {

    var vsixVersionJson = require(vsixVersionFile);

    var major = vsixVersionJson.version.Major;
    var minor = vsixVersionJson.version.Minor;
    var patch = vsixVersionJson.version.Patch;
    var version = major + "." + minor + "." + patch;

    var content = fs.readFileSync(path.join(__dirname, taskFile), "utf8");

    var marker = '$TaskVersion = "';
    var position = content.indexOf(marker);
    if (position <= 0) { 
        cb("COULD NOT FIND MARKER");
    }else{
        var nextQuote = content.indexOf('"', position + marker.length);
    }

    var firstHalf = content.substr(0, position + marker.length);
    var secondHalf = content.substr(nextQuote);
    var finalContent = firstHalf + version + secondHalf;

    fs.writeFileSync(path.join(__dirname, taskFile), finalContent, {encoding: "utf8"});

    cb(null, version);
}

module.exports = lib;
