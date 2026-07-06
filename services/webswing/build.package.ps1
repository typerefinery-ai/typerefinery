param(
  [string]$ServiceName = "webswing",
  [string]$VolumeSize = "50m"
)

$ErrorActionPreference = "Stop"

function Require-Path([string]$PathToCheck, [string]$Message) {
  if (-not (Test-Path $PathToCheck)) {
    throw $Message
  }
}

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$archiveExe = (Resolve-Path (Join-Path $serviceRoot "..\\_archive\\win32\\7za.exe")).Path
$workRoot = Join-Path $serviceRoot "_work"
$stageRoot = Join-Path $workRoot "stage"
$packageRoot = Join-Path $stageRoot $ServiceName
$configStage = Join-Path $packageRoot "config"
$registrationsStage = Join-Path $configStage "registrations"
$archiveBase = Join-Path $serviceRoot "$ServiceName.7z"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"

Write-Host "Cleaning work folders..."
Remove-Item $workRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $registrationsStage | Out-Null

foreach ($item in @(".gitignore", "service.json", "configure.ps1", "run-webswing.bat", "start.ps1", "build.package.ps1")) {
  $source = Join-Path $serviceRoot $item
  Require-Path $source "Missing required file '$item'"
  Copy-Item $source (Join-Path $packageRoot $item) -Force
}

$baseConfig = Join-Path $serviceRoot "config\\webswing.base.json"
Require-Path $baseConfig "Missing required file 'config\\webswing.base.json'"
Copy-Item $baseConfig (Join-Path $configStage "webswing.base.json") -Force

Write-Host "Removing old archives..."
Remove-Item "$archiveBase*" -Force -ErrorAction SilentlyContinue

Push-Location $stageRoot
try {
  Write-Host "Creating split 7z archive volumes ($VolumeSize)..."
  & $archiveExe a -t7z -mx=9 "-v$VolumeSize" $archiveBase ".\\$ServiceName\\*"
  if ($LASTEXITCODE -ne 0) {
    throw "7zip archive creation failed"
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Packaging complete."
Get-ChildItem "$archiveBase*" | Select-Object Name, Length
