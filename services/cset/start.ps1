param(
  [string]$InstallerPath,
  [string]$ExecutablePath
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path

if ($ExecutablePath) {
  $resolvedExecutable = (Resolve-Path $ExecutablePath).Path
  Write-Host "Launching installed CSET executable..."
  Start-Process $resolvedExecutable
  return
}

if (-not $InstallerPath) {
  $installerDir = Join-Path $serviceRoot "installer"
  if (Test-Path $installerDir) {
    $installer = Get-ChildItem $installerDir -Filter *.exe | Select-Object -First 1
    if ($installer) {
      $InstallerPath = $installer.FullName
    }
  }
}

if (-not $InstallerPath) {
  throw "Could not find a CSET installer or executable. Pass -InstallerPath to run the installer or -ExecutablePath to launch an installed copy."
}

$resolvedInstaller = (Resolve-Path $InstallerPath).Path
Write-Host "Launching CSET installer..."
Start-Process $resolvedInstaller
