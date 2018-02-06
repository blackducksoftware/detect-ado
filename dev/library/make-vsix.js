var process = require('process');
var fs = require('fs');
var request = require('request-promise');

var exec = require("child_process").exec;

var lib = {};

lib.buildVsix = function(cb) {
    process.chdir('../../');

    var tfxCreateCommand = "tfx extension create --manifest-globs vsts-extension.json";

    console.log(`Calling '${tfxCreateCommand}'`);

    exec(tfxCreateCommand, (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        if (error) {
            cb(error);
            return;
        }

        var vsixPath = lib.extractStdOutValue("VSIX: ", stdout);
        var packageId = lib.extractStdOutValue("Extension ID: ", stdout);
        var packageVersion = lib.extractStdOutValue("Extension Version: ", stdout);
        
          cb(null, {
                     vsixPath: vsixPath,
                     packageId: packageId,
                     packageVersion: packageVersion
          });
        
    });
}

lib.rename = function (vsixPath, packageId, packageVersion, cb) {
    var newName = `${packageId}.${packageVersion}.vsix`;
    var newPath = `bin/${newName}`;
    console.log('Renaming to ' + newPath);
    fs.rename(vsixPath, newPath, function(err) {
        if (err) {
            cb(err);
        }else{
            console.log('Successfully moved!');
            cb(null, newPath);
        }
    });
} 

lib.extractStdOutValue = function (prefix, stdout) {
    if (stdout.indexOf(prefix)) {
        var remains = stdout.substr(stdout.indexOf(prefix) + prefix.length);
        return remains.split("\n")[0];
    } else {
        return null;
    }
}

module.exports = lib;
