maker.buildVsixAndRename(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!");
        console.log(`Built Vsix: ${result.vsixPath}`)
        console.log(`Final Vsix: ${result.finalVsixPath}`)
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
    }
});
