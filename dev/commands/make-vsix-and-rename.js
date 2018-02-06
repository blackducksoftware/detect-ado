maker.buildVsixAndRename(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!");
        console.log(`Vsix: ${result.vsixPath}`)
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
    }
});
