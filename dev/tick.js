"use strict";
const fs = require("fs");
function updateTaskVersion() {
    const taskjsonpath = "tasks/synopsys-detect-task/task.json";
    let taskjsontext = fs.readFileSync(taskjsonpath);
    let taskjson = JSON.parse(taskjsontext);
    taskjson.version.Patch += 1;
    fs.writeFileSync(taskjsonpath, JSON.stringify(taskjson, null, 2));
}
function updateExtensionVersion() {
    const vsspath = "vss-extension.json";
    let vsstext = fs.readFileSync(vsspath);
    let vssjson = JSON.parse(vsstext);
    var pieces = vssjson.version.split('.');
    pieces[2] = (parseInt(pieces[2]) + 1).toString();
    vssjson.version = pieces.join(".");
    fs.writeFileSync(vsspath, JSON.stringify(vssjson, null, 2));
}
updateTaskVersion();
updateExtensionVersion();
