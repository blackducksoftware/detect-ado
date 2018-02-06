const maker = require('../library/make-vsix.js');
const tickerVsts = require('../library/tick-vsts-patch-version.js');
const tickerTask = require('../library/tick-task-patch-version.js');
const versionSyncer = require('../library/sync-embedded-task-version.js');


tickerTask.tickTask(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked task to:" + newVersion);
});

tickerVsts.tickVsts(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked VSTS to:" + newVersion);
});

versionSyncer.updateEmbeddedVersion(function(err, newVersion) {
    if (err) throw err;
    console.log("Updated embedded version:" + newVersion);
});


maker.buildAndRenameVsix(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!")
        console.log(`Vsix: ${result.vsixPath}`)
        console.log(`Vsix: ${result.finalVsixPath}`)
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
    }
});

