param()

Write-Host "Detect for TFS initializing."

######################LIBRARIES######################

Import-Module $PSScriptRoot\lib\argument-parser.ps1

######################SETTINGS#######################

#Utilize TLS 1.2 for this session
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

#Get Hub Url

Write-Host "Getting inputs from VSTS."

$Service = (Get-VstsInput -Name BlackDuckHubService -Require)
$ServiceEndpoint = Get-VstsEndpoint -Name $Service
$HubUrl = $ServiceEndpoint.Url

#Get Hub Creds

$HubUsername = $ServiceEndpoint.auth.parameters.username
$HubPassword = $ServiceEndpoint.auth.parameters.password

#Get Other Input

$DetectAdditionalArguments = Get-VstsInput -Name DetectArguments -Default ""
$GenerateRiskReport = Get-VstsInput -Name GenerateRiskReport -Default $false
$GenerateTaskSummary = Get-VstsInput -Name GenerateRiskReport -Default $true

$DetectVersion = Get-VstsInput -Name DetectArguments -Default "latest"
$DetectJarPath = Get-VstsInput -Name DetectJarPath -Default ""

$TemporaryFileLocation = Get-VstsInput -Name TemporaryFileLocation -Default ""

$SkipJavaTest = Get-VstsInput -Name SkipJavaTest -Default 0

#Derive Values

if ($TemporaryFileLocation -eq ""){
    $DetectFolder = Join-path $env:AGENT_HOMEDIRECTORY "detect"
    $TemporaryFileLocation = [System.IO.Path]::Combine($DetectFolder, $env:BUILD_DEFINITIONNAME, $env:BUILD_BUILDNUMBER)
}

$RiskReportDirectory = Join-Path $TemporaryFileLocation "RiskReport"
	
#Set powershell environment variables
Write-Host "Setting detect environment variables"
$Env:DETECT_EXIT_CODE_PASSTHRU = "1" #Prevent detect from exiting the session.
$Env:DETECT_JAR_PATH = $DetectJarPath
$Env:TMP = $TemporaryFileLocation
$Env:DETECT_LATEST_RELEASE_VERSION = $DetectVersion
$Env:DETECT_SKIP_JAVA_TEST = $SkipJavaTest

#Set detect environment variables
#We don't want to pass these to the powershell script.
${Env:blackduck.hub.username} = $HubUsername 
${Env:blackduck.hub.password} = $HubPassword

#Create detect argument list
Write-Host "Creating detect arguments"
$DetectArguments = New-Object System.Collections.ArrayList
$DetectArguments.Add("--detect.source.path={0}" -f $ScanTarget)
$DetectArguments.Add("--blackduck.hub.url={0}" -f $HubUrl)

if ($GenerateRiskReport){
    $DetectArguments.Add("--detect.risk.report.pdf=true")
    $DetectArguments.Add("--detect.risk.report.pdf.path=`"{0}`"" -f $RiskReportDirectory)
}

#Ask our lib to parse the string into arguments
$ParsedArguments = Get-ArgumentsFromString -ArgumentString $DetectAdditionalArguments
foreach ($AdditionalArgument in $ParsedArguments){
    Write-Host "Parsed additional argument: {0}" -f $AdditionalArgument
    $DetectArguments.Add($AdditionalArgument);
}

#Import detect library
Write-Host "Downloading detect library"
$DetectDownloadSuccess = 0;
try {
	Invoke-RestMethod https://blackducksoftware.github.io/hub-detect/hub-detect.ps1?$(Get-Random) | Invoke-Expression;
	$DetectDownloadSuccess = 1;
} catch {
    Write-Warning ("Failed to download the latest detect script from the web. Using the last deployed version.")
}

if ($DetectDownloadSuccess -eq 0){
	Write-Host "Importing deployed version of detect library"
	try {
		Import-Module $PSScriptRoot\lib\detect.ps1
	} catch {
		Write-Error "Failed to load the detect library"
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
} catch {
    Write-Warning ("WARNING: Failed to invoke detect.")
}

Write-Host "******************************************************************************"
Write-Host "END OF DETECT"
Write-Host "******************************************************************************"


#$RiskReportFile

if ($GenerateRiskReport){
    $RiskReportFileName = Get-ChildItem -Path $RiskReportDirectory | Select-Object -First 1
    $RiskReportFile = Join-Path $RiskReportDirectory $RiskReportFileName
    Write-Host "INFO: Generated black duck risk report"
    Write-Host ("INFO: File at {0}" -f $RiskReportFile)
    Write-Host "##vso[artifact.upload containerfolder=BlackDuckRiskReport1;artifactname=BlackDuckRispReport1;]$RiskReportFile"
    Write-Host "##vso[artifact.associate type=filepath;artifactname=BlackDuckRispReport2;]$RiskReportFile"
    Write-Host "##vso[task.uploadsummary containerfolder=BlackDuckRiskReport3;artifactname=BlackDuckRispReport3;]$RiskReportFile"
    Write-Host "##vso[task.uploadfile containerfolder=BlackDuckRiskReport4;artifactname=BlackDuckRispReport4;]$RiskReportFile"
}

if ($GenerateTaskSummary){
    $TempFile = [System.IO.Path]::GetTempFileName()

    if ($DetectExitCode -eq 0){
        $Content = "Detect ran succesfully";
    }else{
        $Content = ("There was an issue running detect, exit code: {0}" -f $DetectExitCode);
    }
    
    $Content | set-content $Tempfile
    Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Black Duck Detect;]$Tempfile" 
}
