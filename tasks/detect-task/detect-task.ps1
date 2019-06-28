param()

Write-Host "Detect for ADO initializing."

######################LIBRARIES######################

Import-Module $PSScriptRoot\lib\argument-parser.ps1
Import-Module $PSScriptRoot\lib\proxy-service.ps1

######################SETTINGS#######################

$TaskVersion = "2.0.9"; #Automatically Updated
Write-Host ("Detect for ADO Version {0}" -f $TaskVersion)

#Support all TLS protocols. 
try {
    [Net.ServicePointManager]::SecurityProtocol = "tls, tls11, tls12"
} catch  [Exception] {
    Write-Host ("Failed to enable TLS protocols.")
    Write-Host $_.Exception.GetType().FullName; 
    Write-Host $_.Exception.Message; 
}


#Get Product
$ConfiguredProduct = (Get-VstsInput -Name Products -Default "ALL")

if ($ConfiguredProduct -eq "BD" -OR $ConfiguredProduct -eq "ALL"){

    Write-Host "Getting proxy settings from inputs."

    $ProxyService = (Get-VstsInput -Name BlackDuckProxyService -Default "")
    $UseProxy = $false;
    if ([string]::IsNullOrEmpty($ProxyService)){
        Write-Host ("No proxy service selected.");
    }else{
        Write-Host ("Found proxy service.");
        $UseProxy = $true;
        $ProxyServiceEndpoint = Get-VstsEndpoint -Name $ProxyService
        $ProxyUrl = $ProxyServiceEndpoint.Url
        $ProxyServiceEndpoint.Url | Get-Member
        $ProxyUsername = $ProxyServiceEndpoint.auth.parameters.username
        $ProxyPassword = $ProxyServiceEndpoint.auth.parameters.password
    }

    if ($UseProxy -eq $true){
        $ProxyUri = [System.Uri] $ProxyUrl
        $ProxyHost = $ProxyUri.Host
        $ProxyPort = $ProxyUri.Port
        Write-Host ("Parsed Proxy Host: {0}" -f $ProxyHost)
        Write-Host ("Parsed Proxy Port: {0}" -f $ProxyPort)
        ${Env:blackduck.proxy.host} = $ProxyHost
        ${Env:blackduck.proxy.port} = $ProxyPort
        ${Env:blackduck.proxy.username} = $ProxyUsername
        ${Env:blackduck.proxy.password} = $ProxyPassword
    }

    Write-Host "Getting Black Duck settings from inputs."

    $BlackDuckService = (Get-VstsInput -Name BlackDuckService -Default "")

    if ([string]::IsNullOrEmpty($BlackDuckService)){
        Write-Host ("No Black Duck service selected.");
    }else{
        Write-Host ("Setting Black Duck service properties.");

        $BlackDuckServiceEndpoint = Get-VstsEndpoint -Name $BlackDuckService
        $BlackDuckUrl = $BlackDuckServiceEndpoint.Url

        $BlackDuckApiToken = $BlackDuckServiceEndpoint.auth.parameters.apitoken
        $BlackDuckUsername = $BlackDuckServiceEndpoint.auth.parameters.username
        $BlackDuckPassword = $BlackDuckServiceEndpoint.auth.parameters.password

        #We don't want to pass these to the powershell script as arguments or they will get printed.
        ${Env:blackduck.url} = $BlackDuckUrl
        ${Env:blackduck.api.token} = $BlackDuckApiToken
        ${Env:blackduck.username} = $BlackDuckUsername
        ${Env:blackduck.password} = $BlackDuckPassword
    }

} else {
    Write-Host "Enabling only the Polaris tool."
    ${Env:detect.tools} = "POLARIS";
}


#Get Polaris Information

if ($ConfiguredProduct -eq "PS" -OR $ConfiguredProduct -eq "ALL"){
    Write-Host "Getting Polaris settings from inputs."

    $PolarisService = (Get-VstsInput -Name PolarisService -Default "")

    if ([string]::IsNullOrEmpty($PolarisService)){
        Write-Host ("No polaris service selected.");
    }else{
        Write-Host ("Setting polaris service properties.");

        $PolarisServiceEndpoint = Get-VstsEndpoint -Name $PolarisService
        $PolarisUrl = $PolarisServiceEndpoint.Url

        $PolarisAccessToken = $PolarisServiceEndpoint.auth.parameters.apitoken

        #We don't want to pass these to the powershell script as arguments or they will get printed.
        ${Env:polaris.url} = $PolarisUrl
        ${Env:polaris.access.token} = $PolarisAccessToken
    }

}

#Get Other Input

$DetectAdditionalArguments = Get-VstsInput -Name DetectArguments -Default ""
$AddTaskSummary = Get-VstsInput -Name AddTaskSummary -Default $true

$DetectFolder = Get-VstsInput -Name DetectFolder -Default ""
$DetectVersion = Get-VstsInput -Name DetectVersion -Default "latest"

if ($DetectVersion -eq "latest"){
    $DetectVersion = "" # Detect powershell script expects latest to be "".
}
	
#Set powershell environment variables
Write-Host "Setting detect environment variables"
$Env:DETECT_EXIT_CODE_PASSTHRU = "1" #Prevent detect from exiting the session.
$Env:DETECT_JAR_PATH = $DetectFolder
$Env:DETECT_LATEST_RELEASE_VERSION = $DetectVersion
$Env:DETECT_SOURCE_PATH = $env:BUILD_SOURCESDIRECTORY
${Env:detect.phone.home.passthrough.detect.for.ado.version} = $TaskVersion

#Ask our lib to parse the string into arguments
Write-Host "Parsing additional arguments"
$DetectArguments = New-Object System.Collections.ArrayList
$ParsedArguments = Get-ArgumentsFromString -ArgumentString $DetectAdditionalArguments
foreach ($AdditionalArgument in $ParsedArguments){
    Write-Host ("Parsed additional argument: {0}" -f $AdditionalArgument)
    $DetectArguments.Add($AdditionalArgument) | Out-Null;
}

#Import detect library
Write-Host "Downloading detect powershell library"
$DetectDownloadSuccess = $false;
try {
    $ProxyInfo = Get-ProxyInfo
    Invoke-WebRequestWrapper https://detect.synopsys.com/detect.ps1?$(Get-Random) -ProxyInfo $ProxyInfo | Invoke-Expression;
	$DetectDownloadSuccess = $true;
} catch  [Exception] {
    Write-Host ("Failed to download the latest detect powershell library from the web. Please ensure your connection and proxy can reach detect.synopsys.com.")
    Write-Host $_.Exception.GetType().FullName; 
    Write-Host $_.Exception.Message; 
}

if ($DetectDownloadSuccess -eq $false){
    Write-Error ("Failure: Failed to download the detect script.");
    Write-Host 
    exit 1
}

#Invoke detect
Write-Host "Invoking detect"

Write-Host "******************************************************************************"
Write-Host "START OF DETECT"
Write-Host "******************************************************************************"

$DetectExitCode = -1;
try {
	$DetectExitCode = Detect @DetectArguments
} catch  [Exception] {
    Write-Warning $_.Exception.GetType().FullName; 
    Write-Warning $_.Exception.Message; 
    Write-Error ("Failed to invoke detect.");
}

Write-Host "******************************************************************************"
Write-Host "END OF DETECT"
Write-Host "******************************************************************************"

#Attach detect status code to the task summary.

if ($AddTaskSummary -eq $true){
    $TempFile = [System.IO.Path]::GetTempFileName()

    if ($DetectExitCode -eq 0){
        $Content = "Detect ran succesfully.";
    }else{
        $Content = ("There was an issue running detect, exit code: {0}" -f $DetectExitCode);
    }
    
    $Content | set-content $Tempfile
    Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Synopsys Detect;]$Tempfile" 
}

Write-Host "Plugin finished."

#$Exit Code
if ($DetectExitCode -eq 0){
    Write-Host "Detect Exit Code: 0"
    exit 0
}else{
    Write-Error ("Detect Exit Code: {0}" -f $DetectExitCode)
    exit $DetectExitCode
}

