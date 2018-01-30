var lib = {};

var baseUrl = "https://updates.suite.blackducksoftware.com/integrations/com/blackducksoftware/integration";

lib.upload = function (vsixFullPath, vsixFileName, packageId, packageVersion) {
    if (deploy){
        var deployUrl = `${baseUrl}/${packageId}/${packageVersion}/${vsixFileName}`;

        const options = {
            method: 'PUT',
            url: deployUrl,
            headers: {
                'content-type': 'application/octet-stream'
            }
        };

        fs.createReadStream(vsixFullPath).pipe(request(options)).then(body =>{
            console.log(body);
        })
        .catch(err => {
            console.log(err);
            fs.writeFileSync("out.html", err);
        });
    }
}

module.exports = lib;