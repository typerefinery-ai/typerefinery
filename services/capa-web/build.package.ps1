param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [string]$ServiceName = "capa-web",

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
  throw "Could not find capa web build output under expected dist paths."
}

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$archiveExe = (Resolve-Path (Join-Path $serviceRoot "..\\_archive\\win32\\7za.exe")).Path
$sourceRoot = (Resolve-Path $SourcePath).Path
$webRoot = Join-Path $sourceRoot "web\\explorer"
$packageJson = Join-Path $webRoot "package.json"
$runtimeServer = Join-Path $serviceRoot "runtime\\server.js"
$startScript = Join-Path $serviceRoot "start.ps1"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"
Require-Path $webRoot "Could not find capa web explorer directory under '$SourcePath'"
Require-Path $packageJson "Could not find capa web explorer package.json under '$webRoot'"
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
if ($nodeVersion -notmatch "^v22\.") {
  throw "capa web build should use Node 22. Current version is $nodeVersion"
}

Push-Location $webRoot
try {
  Write-Host "Installing dependencies with npm ci..."
  & npm ci
  if ($LASTEXITCODE -ne 0) {
    throw "npm ci failed"
  }

  Write-Host "Building offline bundle..."
  & npm run build:bundle
  if ($LASTEXITCODE -ne 0) {
    throw "Bundle build failed"
  }
}
finally {
  Pop-Location
}

$distRoot = Resolve-DistRoot @(
  (Join-Path $webRoot "capa-explorer-web"),
  (Join-Path $webRoot "dist")
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
