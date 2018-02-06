const maker = require('../library/make-vsix.js');

maker.buildVsix(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!")
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
    }
});
