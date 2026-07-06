param(
  [string]$InstallRoot = "",
  [switch]$PassThru = $false
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
if (-not $InstallRoot) {
  $InstallRoot = Join-Path $serviceRoot "win32\\ghidra"
}

$installRootResolved = (Resolve-Path $InstallRoot).Path
$launcher = Get-ChildItem -Path $installRootResolved -Recurse -Filter ghidraRun.bat |
  Select-Object -First 1

if (-not $launcher) {
  throw "Could not find ghidraRun.bat under '$installRootResolved'. Install the service first."
}

Write-Host "Launching Ghidra from '$($launcher.FullName)'"
$process = Start-Process -FilePath $launcher.FullName -WorkingDirectory (Split-Path $launcher.FullName -Parent) -PassThru

if ($PassThru) {
  $process
}
