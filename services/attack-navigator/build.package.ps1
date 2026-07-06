param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [string]$ServiceName = "attack-navigator",

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
$sourceRoot = (Resolve-Path $SourcePath).Path
$navAppRoot = Join-Path $sourceRoot "nav-app"
$navPackageJson = Join-Path $navAppRoot "package.json"
$runtimeServer = Join-Path $serviceRoot "runtime\\server.js"
$startScript = Join-Path $serviceRoot "start.ps1"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"
Require-Path $navAppRoot "Could not find Attack Navigator nav-app directory under '$SourcePath'"
Require-Path $navPackageJson "Could not find Attack Navigator package.json under '$navAppRoot'"
Require-Path $runtimeServer "Could not find runtime server script at '$runtimeServer'"
Require-Path $startScript "Could not find start script at '$startScript'"

$workRoot = Join-Path $serviceRoot "_work"
$stageRoot = Join-Path $workRoot "stage"
$packageRoot = Join-Path $stageRoot $ServiceName
$appRoot = Join-Path $packageRoot "app"
$distRoot = Join-Path $navAppRoot "dist\\browser"
$archiveBase = Join-Path $serviceRoot "$ServiceName.7z"

Write-Host "Cleaning work folders..."
Remove-Item $workRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $appRoot | Out-Null

Write-Host "Checking build Node version..."
$nodeVersion = (& node --version).Trim()
if ($nodeVersion -notmatch "^v22\.") {
  throw "Attack Navigator build must use Node 22. Current version is $nodeVersion"
}

Push-Location $navAppRoot
try {
  Write-Host "Installing dependencies with npm ci..."
  & npm ci
  if ($LASTEXITCODE -ne 0) {
    throw "npm ci failed"
  }

  Write-Host "Building production assets..."
  & npm run build -- --configuration production
  if ($LASTEXITCODE -ne 0) {
    throw "Production build failed"
  }
}
finally {
  Pop-Location
}

Require-Path $distRoot "Build output not found at '$distRoot'"

Write-Host "Staging packaged runtime..."
Copy-Item (Join-Path $distRoot "*") $appRoot -Recurse -Force
Copy-Item $runtimeServer (Join-Path $packageRoot "server.js") -Force
Copy-Item $startScript (Join-Path $packageRoot "start.ps1") -Force

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
