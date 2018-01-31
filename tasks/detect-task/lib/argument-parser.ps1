function Get-ArgumentsFromString($ArgumentString) {
    $Parsed = New-Object System.Collections.ArrayList
    $State = "None"
    $Current = ""
    foreach ($character in $DetectAdditionalArguments.ToCharArray()){
        if ($State -eq "None"){
            if ($character -eq ' ' -or $character -eq "`n"){
                if ($Current.Length -gt 0){ $Parsed.Add($Current) | Out-Null; }
                $Current = "";
            }elseif ($character -eq '"'){
                $State = "EscapeQuote";
            }elseif ($character -eq "'"){
                $State = "EscapeSingle";
            }else{
                $Current += $character;
            }
        
        }elseif ($State -eq "EscapeQuote"){
            if ($character -eq '"'){
                $State = "None";
                if ($Current.Length -gt 0){ $Parsed.Add($Current) | Out-Null; }
                $Current = "";
            }else{
                $Current += $character;
            }
        }elseif ($State -eq "EscapeSingle"){
            if ($character -eq "'"){
                $State = "None";
                if ($Current.Length -gt 0){ $Parsed.Add($Current) | Out-Null; }
                $Current = "";
            }else{
                $Current += $character;
            }
        }
        #Write-Host $character;
        #Write-Host $State;
    }

    #Write-Host ("c {0}" -f $Current)
    if ($Current.Length -gt 0){
        #Write-Host "Adding Current"
        #Write-Host $Current
        $Parsed.Add($Current) | Out-Null;
    }

    return $Parsed
}