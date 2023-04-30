# remove any files that are not a specified os type
# usage: ./filter-files.ps1 <os_type>

$os_type = $args[0]

# in services directory find all folder called darwin, linux, windows and remove if the do not patch the os_type
Get-ChildItem -Path .\ -Directory -Recurse -Filter $os_type | ForEach-Object {
    $dir = $_.FullName
    $dir = $dir.Substring(2)
    $dir = $dir.Replace("\", "/")
    $dir = $dir.Replace("/", "\")
    $dir = $dir.Replace("services\", "")
    $dir = $dir.Replace($os_type, "")
    if ($dir -ne "") {
      Write-Host "Removing $dir"
      Remove-Item -Path $dir -Recurse -Force
    }
}


