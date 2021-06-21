const ticker = require('../library/tick-vsts-patch-version.js');


ticker.tickTask(function(err, newVersion) {
    if (err) throw err;
    console.log("Ticked task to:" + newVersion);
});