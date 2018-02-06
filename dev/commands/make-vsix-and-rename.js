maker.buildVsix(function (err, result){
    if (err){
        throw err;
    }else{
        console.log("Built!");
        console.log(`Vsix: ${result.vsixPath}`)
        console.log(`Id: ${result.packageId}`)
        console.log(`Version: ${result.packageVersion}`)
 
        maker.rename(result.vsixPath, result.packageId, result.packageVersion, function (err, newVsix){
            if (err){
                throw error;
            }else{
                console.log("Renamed!");
                console.log(`Final Vsix: ${newVsix}`);
            }
        });
    }
});
