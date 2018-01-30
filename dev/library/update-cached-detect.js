const https = require('https');
const fs = require('fs');

var lib = {};
var url = 'https://blackducksoftware.github.io/hub-detect/hub-detect.ps1';
var file = "../../tasks/detect-task/lib/detect.ps1";
           //to dev (from commands), to repo folder.
lib.updateCachedDetect = function(success, failure) {
    console.log("Downloading from " + url);
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            console.log("Succesfully downloaded.");
            console.log("Writing file to " + file);
            fs.writeFile(file, data, function(err) {
                if (err) {
                    failure(err);
                }

                console.log("The file was saved!");
                success();
            });

        });

    }).on("error", (err) => {
        failure(err);
    });
}

module.exports = lib;