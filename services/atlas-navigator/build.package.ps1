param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [string]$ServiceName = "atlas-navigator",

  [string]$VolumeSize = "50m"
)

$ErrorActionPreference = "Stop"

function Require-Path([string]$PathToCheck, [string]$Message) {
  if (-not (Test-Path $PathToCheck)) {
    throw $Message
  }
}

function Resolve-DistRoot([string[]]$Candidates) {
  foreach ($candidate in $Candidates) {
    if (Test-Path $candidate) {
      return (Resolve-Path $candidate).Path
    }
  }
  throw "Could not find Atlas Navigator build output under expected dist paths."
}

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$archiveExe = (Resolve-Path (Join-Path $serviceRoot "..\\_archive\\win32\\7za.exe")).Path
$sourceRoot = (Resolve-Path $SourcePath).Path
$navAppRoot = Join-Path $sourceRoot "nav-app"
$navPackageJson = Join-Path $navAppRoot "package.json"
$runtimeServer = Join-Path $serviceRoot "runtime\\server.js"
$startScript = Join-Path $serviceRoot "start.ps1"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"
Require-Path $navAppRoot "Could not find Atlas Navigator nav-app directory under '$SourcePath'"
Require-Path $navPackageJson "Could not find Atlas Navigator package.json under '$navAppRoot'"
Require-Path $runtimeServer "Could not find runtime server script at '$runtimeServer'"
Require-Path $startScript "Could not find start script at '$startScript'"

$workRoot = Join-Path $serviceRoot "_work"
$stageRoot = Join-Path $workRoot "stage"
$packageRoot = Join-Path $stageRoot $ServiceName
$appRoot = Join-Path $packageRoot "app"
$archiveBase = Join-Path $serviceRoot "$ServiceName.7z"

Write-Host "Cleaning work folders..."
Remove-Item $workRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $appRoot | Out-Null

Write-Host "Checking build Node version..."
$nodeVersion = (& node --version).Trim()
if ($nodeVersion -notmatch "^v16\.") {
  throw "Atlas Navigator build should use Node 16. Current version is $nodeVersion"
}

Push-Location $navAppRoot
try {
  Write-Host "Installing dependencies with npm ci..."
  & npm ci
  if ($LASTEXITCODE -ne 0) {
    throw "npm ci failed"
  }

  Write-Host "Building production assets..."
  & npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Production build failed"
  }
}
finally {
  Pop-Location
}

$distRoot = Resolve-DistRoot @(
  (Join-Path $navAppRoot "dist\\browser"),
  (Join-Path $navAppRoot "dist\\nav-app\\browser"),
  (Join-Path $navAppRoot "dist\\nav-app"),
  (Join-Path $navAppRoot "dist")
)

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
