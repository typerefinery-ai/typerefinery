param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [string]$ServiceName = "d3fend",

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
$runtimeServer = Join-Path $serviceRoot "runtime\\server.js"
$startScript = Join-Path $serviceRoot "start.ps1"
$indexFile = Join-Path $sourceRoot "index.html"

Require-Path $archiveExe "Could not find bundled 7zip executable at services\\_archive\\win32\\7za.exe"
Require-Path $indexFile "Could not find D3FEND static site index.html under '$SourcePath'"
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

Write-Host "Staging static site..."
Get-ChildItem $sourceRoot -Force | Where-Object { $_.Name -notin @(".git", ".github") } | ForEach-Object {
  Copy-Item $_.FullName $appRoot -Recurse -Force
}

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
