#Detect Powershell Script
#Recommended Invocation: powershell "irm https://blackducksoftware.github.io/hub-detect/hub-detect.ps1?$(Get-Random) | iex; detect"

function Get-EnvironmentVariable($Key, $DefaultValue) { if (-not (Test-Path Env:$Key)) { return $DefaultValue; }else{ return (Get-ChildItem Env:$Key).Value; } }

# DETECT_LATEST_RELEASE_VERSION should be set in your
# environment if you wish to use a version different
# from LATEST.
$EnvDetectDesiredVersion = Get-EnvironmentVariable -Key "DETECT_LATEST_RELEASE_VERSION" -DefaultValue "";

# If you would like to enable the shell script to use
# the latest snapshot instead of the latest release,
# specify DETECT_USE_SNAPSHOT=1 in your environment.
# The default is to NOT use snapshots. If you enable
# snapshots, the jar file will be downloaded whenever
# a new commit is added to the master branch.
$EnvDetectUseSnapshot = Get-EnvironmentVariable -Key "DETECT_USE_SNAPSHOT" -DefaultValue "0";

# If you want to skip the test for java
# DETECT_SKIP_JAVA_TEST=1
$EnvDetectSkipJavaTest = Get-EnvironmentVariable -Key "DETECT_SKIP_JAVA_TEST" -DefaultValue "";

# If you do not want to exit with the detect exit code,
# set DETECT_EXIT_CODE_PASSTHRU to 1 and this script won't exit, but simply return it (pass it thru).
$EnvDetectExitCodePassthru = Get-EnvironmentVariable -Key "DETECT_EXIT_CODE_PASSTHRU" -DefaultValue "";

# To override the default location specify your own DETECT_JAR_PATH
# Otherwise, if the environment temp folder is set, it will be used.
# Otherwise, a temporary folder will be created in your home directory
$EnvDetectFolder = Get-EnvironmentVariable -Key "DETECT_JAR_PATH" -DefaultValue "";
$EnvTempFolder = Get-EnvironmentVariable -Key "TMP" -DefaultValue "";
$EnvHomeTempFolder = "$HOME\tmp"

# If you want to pass proxy information, use detect environment variables such as 'blackduck.hub.proxy.host'
# If you do pass the proxy information in this way, you do not need to supply it to detect as arguments. 
# Note: This script will not pick up proxy information from the passed 'detect arguments'
# Note: This script will not pick up proxy information passed to the bash script using 'DETECT_CURL_OPTS'

#TODO: Mirror the functionality of the shell script and allow Java opts.

# If you want to pass any java options to the
# invocation, specify DETECT_JAVA_OPTS in your
# environment. For example, to specify a 6 gigabyte
# heap size, you would set DETECT_JAVA_OPTS=-Xmx6G.
#$DetectJavaOpts = Get-EnvironmentVariable -Key "DETECT_JAVA_OPTS" -DefaultValue "";

$Version = "0.6.5"

$DetectReleaseBaseUrl = "https://test-repo.blackducksoftware.com/artifactory/bds-integrations-release/com/blackducksoftware/integration/hub-detect"
$DetectSnapshotBaseUrl = "https://test-repo.blackducksoftware.com/artifactory/bds-integrations-snapshot/com/blackducksoftware/integration/hub-detect"
$DetectCommitUrl = "https://blackducksoftware.github.io/hub-detect/latest-commit-id.txt"
$DetectVersionUrl = "https://test-repo.blackducksoftware.com/artifactory/api/search/latestVersion?g=com.blackducksoftware.integration&a=hub-detect&repos=bds-integrations-release"

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 #Enable TLS2

function Detect {
    Write-Host "Detect Powershell Script $Version"
    
    if ($EnvDetectSkipJavaTest -ne "1"){
    	if (Test-JavaNotAvailable){ #If java is not available, we abort early.
			$JavaExitCode = 127 #Command not found http://tldp.org/LDP/abs/html/exitcodes.html 
    		if ($EnvDetectExitCodePassthru -eq "1"){
		        return $JavaExitCode
		    }else{
		    	exit $JavaExitCode
		    }
    	}
    }else{
   		Write-Host "Skipping java test."
    }

    Write-Host "Initializing detect folder."
    $DetectFolder = Initialize-DetectFolder -DetectFolder $EnvDetectFolder -TempFolder $EnvTempFolder -HomeTempFolder $EnvHomeTempFolder

    Write-Host "Checking for proxy."
    $ProxyInfo = Get-ProxyInfo

    Write-Host "Getting detect."
    if ($EnvDetectUseSnapshot -eq "1"){
        $DetectJarFile = Get-DetectSnapshotJar -DetectFolder $DetectFolder -DetectVersion $EnvDetectDesiredVersion -ProxyInfo $ProxyInfo
    }else{
        $DetectJarFile = Get-DetectJar -DetectFolder $DetectFolder -DetectVersion $EnvDetectDesiredVersion -ProxyInfo $ProxyInfo
    }

    Write-Host "Executing detect."
    $DetectArgs = $args;
    $DetectExitCode = Invoke-Detect -DetectJar $DetectJarFile -DetectArgs $DetectArgs
    
    if ($EnvDetectExitCodePassthru -eq "1"){
        return $DetectExitCode
    }else{
    	exit $DetectExitCode
    }
}

function Get-ProxyInfo () {
    $ProxyInfoProperties = @{
        'Uri'=$null
        'Credentials'=$null
    }

    try {

        $ProxyHost = ${Env:blackduck.hub.proxy.host};
        
        if ([string]::IsNullOrEmpty($ProxyHost)){
			$ProxyHost = ${Env:BLACKDUCK_HUB_PROXY_HOST};
		}
        
        if ([string]::IsNullOrEmpty($ProxyHost)){
            Write-Host "Skipping proxy, no host found."
        }else{
            Write-Host "Found proxy host."
            $ProxyUrlBuilder = New-Object System.UriBuilder -ArgumentList $ProxyHost

            $ProxyPort = ${Env:blackduck.hub.proxy.port};

			if ([string]::IsNullOrEmpty($ProxyPort)){
				$ProxyPort = ${Env:BLACKDUCK_HUB_PROXY_PORT};
			}

            if ([string]::IsNullOrEmpty($ProxyPort)){
                Write-Host "No proxy port found."
            }else{
                Write-Host "Found proxy port."
                $ProxyUrlBuilder.Port = $ProxyPort
            }

            $ProxyInfoProperties.Uri = $ProxyUrlBuilder.Uri

            #Handle credentials
            $ProxyUsername = ${Env:blackduck.hub.proxy.username};
            $ProxyPassword = ${Env:blackduck.hub.proxy.password};
            
            if ([string]::IsNullOrEmpty($ProxyUsername)){
				$ProxyUsername = ${BLACKDUCK_HUB_PROXY_USERNAME};
			}
			
			if ([string]::IsNullOrEmpty($ProxyPassword)){
				$ProxyPassword = ${BLACKDUCK_HUB_PROXY_PASSWORD};
			}

            if ([string]::IsNullOrEmpty($ProxyPassword) -or [string]::IsNullOrEmpty($ProxyUsername)){
                Write-Host "No proxy credentials found."
            }else{
                Write-Host "Found proxy credentials."
                $ProxySecurePassword = ConvertTo-SecureString $ProxyPassword -AsPlainText -Force
                $ProxyCredentials = New-Object System.Management.Automation.PSCredential ($ProxyUsername, $ProxySecurePassword)

                $ProxyInfoProperties.Credentials = $ProxyCredentials;
            }

            Write-Host "Successfully setup proxy."
        }

    } catch [Exception] {
        Write-Host ("An exception occurred setting up the proxy, will continue but will not use a proxy.")
        Write-Host ("  Reason: {0}" -f $_.Exception.GetType().FullName); 
        Write-Host ("  Reason: {0}" -f $_.Exception.Message); 
        Write-Host ("  Reason: {0}" -f $_.Exception.StackTrace); 
    }

    $ProxyInfo = New-Object -TypeName PSObject -Prop $ProxyInfoProperties

    return $ProxyInfo;
}

function Invoke-WebRequestWrapper($Url, $ProxyInfo, $DownloadLocation = $null) {
    $parameters = @{}
    try {
        if ($DownloadLocation -ne $null){
            $parameters.Add("OutFile", $DownloadLocation);
        }
        if ($ProxyInfo -ne $null){
            if ($ProxyInfo.Uri -ne $null){
                $parameters.Add("Proxy", $ProxyInfo.Uri);
            }
            if ($ProxyInfo.Credentials -ne $null){
                $parameters.Add("ProxyCredential",$ProxyInfo.Credentials);
            }
        }
    }catch [Exception] {
        Write-Host ("An exception occurred setting additional properties on web request.")
        Write-Host ("  Reason: {0}" -f $_.Exception.GetType().FullName); 
        Write-Host ("  Reason: {0}" -f $_.Exception.Message); 
        Write-Host ("  Reason: {0}" -f $_.Exception.StackTrace);
    }
    
    return Invoke-WebRequest $Url -UseBasicParsing @parameters
}

function Get-DetectSnapshotJar ($DetectFolder, $DetectVersion, $ProxyInfo) {
    if ($DetectVersion -eq ""){
        $DetectVersion = "latest-SNAPSHOT"
    }
    
    Write-Host "Using detect version $DetectVersion"

    $DetectJarFile = "$DetectFolder\hub-detect-$DetectVersion.jar"
    $DetectCurrentCommitFile = "$DetectFolder\hub-detect-latest-commit.txt"

    $DetectJarExists = Test-Path $DetectJarFile
    $DetectCurrentCommitFileExists = Test-Path $DetectCurrentCommitFile
    $DetectLatestCommit = Invoke-WebRequestWrapper -Url $DetectCommitUrl -ProxyInfo $ProxyInfo
    $DetectLatestCommit = $DetectLatestCommit.ToString().Trim()
    Write-Host "Detect jar exists '$DetectJarExists', commit file exists '$DetectCurrentCommitFileExists', latest commit '$DetectLatestCommit'"

    $Download = $TRUE;
    if ($DetectJarExists -and $DetectCurrentCommitFileExists){
        $DetectCurrentCommit = Get-Content $DetectCurrentCommitFile
        $DetectCurrentCommit = $DetectCurrentCommit.Trim()
        Write-Host "Current commit '$DetectCurrentCommit'"
        if ($DetectCurrentCommit -eq $DetectLatestCommit){
            $Download = $FALSE;
        }
    }

    if ($Download){
        $DetectUrl = Join-DetectUrl -DetectBaseUrl $DetectSnapshotBaseUrl -DetectVersion $DetectVersion
        Receive-DetectJar -DetectUrl $DetectUrl -DetectJarFile $DetectJarFile -ProxyInfo $ProxyInfo
        Set-Content $DetectCurrentCommitFile $DetectLatestCommit
    }else{
        Write-Host "You have already downloaded the latest file, so the local file will be used."
    }
    
    return $DetectJarFile    
}

function Get-DetectJar ($DetectFolder, $DetectVersion, $ProxyInfo) {
    if ($DetectVersion -eq ""){
        $DetectVersion = Receive-DetectLatestVersion -ProxyInfo $ProxyInfo
    }

	Write-Host "Using detect version $DetectVersion"

    $DetectJarFile = "$DetectFolder\hub-detect-$DetectVersion.jar"

    $DetectJarExists = Test-Path $DetectJarFile
    Write-Host "Detect jar exists '$DetectJarExists'"

    if (!$DetectJarExists){
        $DetectUrl = Join-DetectUrl -DetectBaseUrl $DetectReleaseBaseUrl -DetectVersion $DetectVersion
        Receive-DetectJar -DetectUrl $DetectUrl -DetectJarFile $DetectJarFile -ProxyInfo $ProxyInfo
    }else{
        Write-Host "You have already downloaded the latest file, so the local file will be used."
    }

    return $DetectJarFile    
}

function Invoke-Detect ($DetectJarFile, $DetectArgs) {
	${Env:detect.phone.home.passthrough.powershell.version} = $Version
    $JavaArgs = @("-jar", $DetectJarFile)
    $AllArgs =  $JavaArgs + $DetectArgs
    Set-ToEscaped($AllArgs)
    Write-Host "Running detect: $AllArgs"
    $DetectProcess = Start-Process java -ArgumentList $AllArgs -NoNewWindow -PassThru
    Wait-Process -InputObject $DetectProcess -ErrorAction SilentlyContinue
    $DetectExitCode = $DetectProcess.ExitCode;
    Write-Host "Result code of $DetectExitCode, exiting"
    return $DetectExitCode
}

function Join-DetectUrl ($DetectBaseUrl, $DetectVersion) {
    return "$DetectBaseUrl/${DetectVersion}/hub-detect-${DetectVersion}.jar"
}

function Initialize-DetectFolder ($DetectFolder, $TempFolder, $HomeTempFolder) {
    if ($DetectFolder -ne ""){
        Write-Host "Using supplied detect folder: $DetectFolder"
        return Initialize-Folder -Folder $DetectFolder
    }

    if ($TempFolder -ne ""){
        Write-Host "Using system temp folder: $TempFolder"
        return Initialize-Folder -Folder $TempFolder
    }

    return Initialize-Folder -Folder $HomeTempFolder
}

function Initialize-Folder ($Folder) {
    If(!(Test-Path $Folder)) {
        Write-Host "Created folder: $Folder"
        New-Item -ItemType Directory -Force -Path $Folder | Out-Null #Pipe to Out-Null to prevent dirtying to the function output
    }
    return $Folder
}

function Receive-DetectLatestVersion ($ProxyInfo) {
    Write-Host "Finding latest detect version."
    $DetectVersion = Invoke-WebRequestWrapper -Url $DetectVersionUrl -ProxyInfo $ProxyInfo
    Write-Host "Resolved version $DetectVersion"
    return $DetectVersion
}

function Receive-DetectJar ($DetectUrl, $DetectJarFile, $ProxyInfo) {
    Write-Host "You don't have detect. Downloading now."
    Write-Host "Using url $DetectUrl"
    $Request = Invoke-WebRequestWrapper -Url $DetectUrl -DownloadLocation $DetectJarFile -ProxyInfo $ProxyInfo
    $DetectJarExists = Test-Path $DetectJarFile
    Write-Host "Downloaded detect jar successfully '$DetectJarExists'"
}

function Set-ToEscaped ($ArgArray){
	for ($i = 0; $i -lt $ArgArray.Count ; $i++) {
		$Value = $ArgArray[$i]
        $ArgArray[$i] = """$Value"""
    }
}

function Test-JavaNotAvailable() {
	Write-Host "Checking if Java is installed by asking for version."
	try {
		$ProcessStartInfo = New-object System.Diagnostics.ProcessStartInfo 
		$ProcessStartInfo.CreateNoWindow = $true 
		$ProcessStartInfo.UseShellExecute = $false 
		$ProcessStartInfo.RedirectStandardOutput = $true 
		$ProcessStartInfo.RedirectStandardError = $true 
		$ProcessStartInfo.FileName = 'java' 
		$ProcessStartInfo.Arguments = @("-version") 
		$Process = New-Object System.Diagnostics.Process 
		$Process.StartInfo = $ProcessStartInfo
		[void]$Process.Start()
		$StdOutput = $process.StandardOutput.ReadToEnd()
		$StdError = $process.StandardError.ReadToEnd() 
		$Process.WaitForExit()
		Write-Host "Java Standard Output: $StdOutput"
		Write-Host "Java Error Output: $StdError"
		Write-Host "Successfully able to start java and get version."
		return $FALSE;
	}catch { 
		Write-Host "An error occurred checking the Java version. Please ensure Java is installed."
		return $TRUE;
	}
}
