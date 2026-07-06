param(
  [string]$ServiceName = "caldera",
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
$composeFile = Join-Path $serviceRoot "docker-compose.yml"
$envTemplate = Join-Path $serviceRoot ".env.template"
$startScript = Join-Path $serviceRoot "start.ps1"
$stopScript = Join-Path $serviceRoot "stop.ps1"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"
Require-Path $composeFile "Could not find docker-compose.yml at '$composeFile'"
Require-Path $envTemplate "Could not find env template at '$envTemplate'"
Require-Path $startScript "Could not find start script at '$startScript'"
Require-Path $stopScript "Could not find stop script at '$stopScript'"

$workRoot = Join-Path $serviceRoot "_work"
$stageRoot = Join-Path $workRoot "stage"
$packageRoot = Join-Path $stageRoot $ServiceName
$dataDir = Join-Path $packageRoot "data"
$archiveBase = Join-Path $serviceRoot "$ServiceName.7z"

Write-Host "Cleaning work folders..."
Remove-Item $workRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $packageRoot | Out-Null
New-Item -ItemType Directory -Force $dataDir | Out-Null

Copy-Item $composeFile (Join-Path $packageRoot "docker-compose.yml") -Force
Copy-Item $envTemplate (Join-Path $packageRoot ".env.template") -Force
Copy-Item $startScript (Join-Path $packageRoot "start.ps1") -Force
Copy-Item $stopScript (Join-Path $packageRoot "stop.ps1") -Force

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
Write-Host "Archive files:"
Get-ChildItem "$archiveBase*" | Select-Object Name, Length
