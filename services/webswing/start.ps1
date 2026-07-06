param(
  [string]$InstallRoot = "",
  [switch]$PassThru = $false
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$launcher = Join-Path $serviceRoot "run-webswing.bat"

if (-not (Test-Path $launcher)) {
  if (-not $InstallRoot) {
    $InstallRoot = Join-Path $serviceRoot "win32\\webswing"
  }

  $installRootResolved = (Resolve-Path $InstallRoot).Path
  # Fall back to the extracted launcher only if the service-level wrapper is unavailable.
  $launcher = Get-ChildItem -Path $installRootResolved -Recurse -Filter webswing.bat |
    Select-Object -ExpandProperty FullName -First 1
}

if (-not $launcher) {
  throw "Could not find a Webswing launcher under '$serviceRoot'. Install the service first."
}

Write-Host "Starting Webswing from '$launcher'"
$process = Start-Process -FilePath $launcher -WorkingDirectory (Split-Path $launcher -Parent) -PassThru

if ($PassThru) {
  $process
}
