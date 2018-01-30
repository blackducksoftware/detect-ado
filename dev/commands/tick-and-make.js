const maker = require('../library/make-vsix.js');
const tickerVsts = require('../library/tick-vsts-patch-version.js');
const tickerTask = require('../library/tick-task-patch-version.js');


tickerTask.tickTask(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked task to:" + newVersion);
});

tickerVsts.tickVsts(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked VSTS to:" + newVersion);
});

maker.buildVsix(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!")
        console.log(`Vsix: ${result.vsixPath}`)
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
    }
});