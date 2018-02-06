const maker = require('../library/make-vsix.js');

maker.buildVsix(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!")
    }
});
