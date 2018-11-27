param()

Write-Host "Detect for TFS initializing."

######################LIBRARIES######################

Import-Module $PSScriptRoot\lib\argument-parser.ps1

######################SETTINGS#######################

$TaskVersion = "1.1.2"; #Automatically Updated
Write-Host ("Detect for TFS Version {0}" -f $TaskVersion)

#Support all TLS protocols. 
try {
    [Net.ServicePointManager]::SecurityProtocol = "tls, tls11, tls12"
} catch  [Exception] {
    Write-Host ("Failed to enable TLS protocols.")
    Write-Host $_.Exception.GetType().FullName; 
    Write-Host $_.Exception.Message; 
}
#Get Hub Url

Write-Host "Getting inputs from VSTS."

#Get Hub Information

$Service = (Get-VstsInput -Name BlackDuckHubService -Default "")

#Get Proxy Information 

$ProxyService = (Get-VstsInput -Name BlackDuckHubProxyService -Default "")
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

#Get Other Input

$DetectAdditionalArguments = Get-VstsInput -Name DetectArguments -Default ""
$AddTaskSummary = Get-VstsInput -Name AddTaskSummary -Default $true

$DetectVersion = Get-VstsInput -Name DetectVersion -Default "latest"
$DetectFolder = Get-VstsInput -Name DetectFolder -Default ""

#Derive Values

if ($DetectVersion -eq "latest"){
    $DetectVersion = "" # Detect powershell script expects latest to be "".
}
	
#Set powershell environment variables
Write-Host "Setting detect environment variables"
$Env:DETECT_EXIT_CODE_PASSTHRU = "1" #Prevent detect from exiting the session.
$Env:DETECT_JAR_PATH = $DetectFolder
$Env:DETECT_LATEST_RELEASE_VERSION = $DetectVersion
Write-Host "Setting detect source path to build directory"
$Env:DETECT_SOURCE_PATH = $env:BUILD_SOURCESDIRECTORY

if ([string]::IsNullOrEmpty($Service)){
    Write-Host ("No service selected.");
}else{
    Write-Host ("Setting black duck service properties.");

    $ServiceEndpoint = Get-VstsEndpoint -Name $Service
    $HubUrl = $ServiceEndpoint.Url

    $ApiToken = $ServiceEndpoint.auth.parameters.apitoken
    $HubUsername = $ServiceEndpoint.auth.parameters.username
    $HubPassword = $ServiceEndpoint.auth.parameters.password

    #We don't want to pass these to the powershell script as arguments or they will get printed.
    ${Env:blackduck.url} = $HubUrl
    ${Env:blackduck.api.token} = $ApiToken
    ${Env:blackduck.username} = $HubUsername
    ${Env:blackduck.password} = $HubPassword
}

Write-Host ("Setting tfs properties.");

${Env:detect.phone.home.passthrough.detect.for.tfs.version} = $TaskVersion

if ($UseProxy -eq $true){
    $ProxyUri = [System.Uri] $ProxyUrl
    $ProxyHost = ("{0}://{1}" -f $ProxyUri.Scheme, $ProxyUri.Host)
    $ProxyPort = $ProxyUri.Port
    Write-Host ("Parsed Proxy Host: {0}" -f $ProxyHost)
    Write-Host ("Parsed Proxy Port: {0}" -f $ProxyPort)
    ${Env:blackduck.proxy.host} = $ProxyHost
    ${Env:blackduck.proxy.port} = $ProxyPort
    ${Env:blackduck.proxy.password} = $ProxyUsername
    ${Env:blackduck.proxy.username} = $ProxyPassword
}

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
	Invoke-RestMethod https://blackducksoftware.github.io/hub-detect/hub-detect.ps1?$(Get-Random) | Invoke-Expression;
	$DetectDownloadSuccess = $true;
} catch  [Exception] {
    Write-Host ("Failed to download the latest detect powershell library from the web. Using the embedded version.")
    Write-Host $_.Exception.GetType().FullName; 
    Write-Host $_.Exception.Message; 
}

if ($DetectDownloadSuccess -eq $false){
	Write-Host "Importing embedded version of detect powershell library"
	try {
		Import-Module $PSScriptRoot\lib\detect.ps1
	} catch  [Exception] {
        Write-Warning $_.Exception.GetType().FullName; 
        Write-Warning $_.Exception.Message;
        Write-Error ("Failed to load detect powershell library.")
    }
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

if ($AddTaskSummary -eq $true){
    $TempFile = [System.IO.Path]::GetTempFileName()

    if ($DetectExitCode -eq 0){
        $Content = "Detect ran succesfully.";
    }else{
        $Content = ("There was an issue running detect, exit code: {0}" -f $DetectExitCode);
    }
    
    $Content | set-content $Tempfile
    Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Black Duck Detect;]$Tempfile" 
}

Write-Host "TFS plugin finished."

#$Exit Code
if ($DetectExitCode -eq 0){
    Write-Host "Detect Exit Code: 0"
    exit 0
}else{
    Write-Error ("Detect Exit Code: {0}" -f $DetectExitCode)
    exit $DetectExitCode
}

