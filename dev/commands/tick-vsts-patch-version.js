const ticker = require('../library/tick-vsts-patch-version.js');

ticker.tickVsts(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked VSTS to:" + newVersion);
});