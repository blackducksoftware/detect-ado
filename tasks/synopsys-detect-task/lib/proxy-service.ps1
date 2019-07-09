#### COPIED FROM THE DETECT.PS1 SCRIPTS

function Get-EnvironmentVariable($Key, $DefaultValue) { if (-not (Test-Path Env:$Key)) { return $DefaultValue; }else { return (Get-ChildItem Env:$Key).Value; } }
function Get-FirstFromEnv($Names) {
    foreach ($Name in $Names) {
        $Value = Get-EnvironmentVariable -Key $Name -Default $null;
        if (-Not [string]::IsNullOrEmpty($Value)) {
            return $Value;
        }
    }
    return $null;
}

function Invoke-WebRequestWrapper($Url, $ProxyInfo, $DownloadLocation = $null) {
    $parameters = @{}
    try {
        if ($DownloadLocation -ne $null) {
            $parameters.Add("OutFile", $DownloadLocation);
        }
        if ($ProxyInfo -ne $null) {
            if ($ProxyInfo.Uri -ne $null) {
                $parameters.Add("Proxy", $ProxyInfo.Uri);
            }
            if ($ProxyInfo.Credentials -ne $null) {
                $parameters.Add("ProxyCredential", $ProxyInfo.Credentials);
            }
        }
    }
    catch [Exception] {
        Write-Host ("An exception occurred setting additional properties on web request.")
        Write-Host ("  Reason: {0}" -f $_.Exception.GetType().FullName); 
        Write-Host ("  Reason: {0}" -f $_.Exception.Message); 
        Write-Host ("  Reason: {0}" -f $_.Exception.StackTrace);
    }
    
    return Invoke-WebRequest $Url -UseBasicParsing @parameters
}


function Get-ProxyInfo () {
    $ProxyInfoProperties = @{
        'Uri'         = $null
        'Credentials' = $null
    }

    try {

        $ProxyHost = Get-FirstFromEnv @("blackduck.proxy.host", "BLACKDUCK_PROXY_HOST", "blackduck.hub.proxy.host", "BLACKDUCK_HUB_PROXY_HOST");
        
        if ([string]::IsNullOrEmpty($ProxyHost)) {
            Write-Host "Skipping proxy, no host found."
        }
        else {
            Write-Host "Found proxy host."
            $ProxyUrlBuilder = New-Object System.UriBuilder -ArgumentList $ProxyHost

            $ProxyPort = Get-FirstFromEnv @("blackduck.proxy.port", "BLACKDUCK_PROXY_PORT", "blackduck.hub.proxy.port", "BLACKDUCK_HUB_PROXY_PORT"); 

            if ([string]::IsNullOrEmpty($ProxyPort)) {
                Write-Host "No proxy port found."
            }
            else {
                Write-Host "Found proxy port."
                $ProxyUrlBuilder.Port = $ProxyPort
            }

            $ProxyInfoProperties.Uri = $ProxyUrlBuilder.Uri

            #Handle credentials
            $ProxyUsername = Get-FirstFromEnv @("blackduck.proxy.username", "BLACKDUCK_PROXY_USERNAME", "blackduck.hub.proxy.username", "BLACKDUCK_HUB_PROXY_USERNAME"); 
            $ProxyPassword = Get-FirstFromEnv @("blackduck.proxy.password", "BLACKDUCK_PROXY_PASSWORD", "blackduck.hub.proxy.password", "BLACKDUCK_HUB_PROXY_PASSWORD"); 

            if ([string]::IsNullOrEmpty($ProxyPassword) -or [string]::IsNullOrEmpty($ProxyUsername)) {
                Write-Host "No proxy credentials found."
            }
            else {
                Write-Host "Found proxy credentials."
                $ProxySecurePassword = ConvertTo-SecureString $ProxyPassword -AsPlainText -Force
                $ProxyCredentials = New-Object System.Management.Automation.PSCredential ($ProxyUsername, $ProxySecurePassword)

                $ProxyInfoProperties.Credentials = $ProxyCredentials;
            }

            Write-Host "Successfully setup proxy."
        }

    }
    catch [Exception] {
        Write-Host ("An exception occurred setting up the proxy, will continue but will not use a proxy.")
        Write-Host ("  Reason: {0}" -f $_.Exception.GetType().FullName); 
        Write-Host ("  Reason: {0}" -f $_.Exception.Message); 
        Write-Host ("  Reason: {0}" -f $_.Exception.StackTrace); 
    }

    $ProxyInfo = New-Object -TypeName PSObject -Prop $ProxyInfoProperties

    return $ProxyInfo;
}