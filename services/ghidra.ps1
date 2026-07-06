param(
  [switch]$Setup = $false,
  [switch]$Start = $false
)

$ErrorActionPreference = "Stop"

$serviceRoot = Join-Path $PSScriptRoot "ghidra"
$archiveRoot = Join-Path $serviceRoot "win32\\ghidra"
$webswingServiceRoot = Join-Path $PSScriptRoot "webswing"
$serviceConfig = Get-Content (Join-Path $serviceRoot "service.json") -Raw | ConvertFrom-Json
$archiveConfig = $serviceConfig.execconfig.setuparchive.win32

function Install-GhidraArchive {
  New-Item -ItemType Directory -Force -Path (Split-Path $archiveRoot -Parent) | Out-Null

  $archivePath = Join-Path (Split-Path $archiveRoot -Parent) $archiveConfig.name
  if (-not (Test-Path $archivePath)) {
    # Download the exact release declared in service.json so wrapper tests match service installs.
    Write-Host "Downloading Ghidra archive from '$($archiveConfig.archiveUrl)'"
    Invoke-WebRequest -Uri $archiveConfig.archiveUrl -OutFile $archivePath
  }

  if (-not (Test-Path $archiveRoot)) {
    # Extract into the same win32/output layout the service manager uses for setuparchive.
    Write-Host "Extracting Ghidra archive into '$archiveRoot'"
    New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null
    Expand-Archive -Path $archivePath -DestinationPath $archiveRoot -Force
  }
}

if ($Setup) {
  Install-GhidraArchive
  & (Join-Path $serviceRoot "setup.ps1") -ArchiveRoot $archiveRoot -WebswingServiceRoot $webswingServiceRoot
}
else {
  & (Join-Path $serviceRoot "start.ps1")
}
