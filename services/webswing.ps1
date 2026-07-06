param(
  [switch]$Setup = $false,
  [switch]$Configure = $false,
  [switch]$Start = $false
)

$ErrorActionPreference = "Stop"

$serviceRoot = Join-Path $PSScriptRoot "webswing"
$archiveRoot = Join-Path $serviceRoot "win32\\webswing"
$serviceConfig = Get-Content (Join-Path $serviceRoot "service.json") -Raw | ConvertFrom-Json
$archiveConfig = $serviceConfig.execconfig.setuparchive.win32

function Install-WebswingArchive {
  New-Item -ItemType Directory -Force -Path (Split-Path $archiveRoot -Parent) | Out-Null

  $archivePath = Join-Path (Split-Path $archiveRoot -Parent) $archiveConfig.name
  if (-not (Test-Path $archivePath)) {
    # Keep the wrapper aligned with the service-manager install flow by downloading the configured archive.
    Write-Host "Downloading Webswing archive from '$($archiveConfig.archiveUrl)'"
    Invoke-WebRequest -Uri $archiveConfig.archiveUrl -OutFile $archivePath
  }

  if (-not (Test-Path $archiveRoot)) {
    # Extract into the same win32/output layout used by service.json setuparchive.
    Write-Host "Extracting Webswing archive into '$archiveRoot'"
    New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null
    Expand-Archive -Path $archivePath -DestinationPath $archiveRoot -Force
  }
}

if ($Setup) {
  Install-WebswingArchive
  & (Join-Path $serviceRoot "configure.ps1") -ArchiveRoot $archiveRoot -ConfigRoot (Join-Path $serviceRoot "config")
}
elseif ($Configure) {
  & (Join-Path $serviceRoot "configure.ps1") -ArchiveRoot $archiveRoot -ConfigRoot (Join-Path $serviceRoot "config")
}
else {
  & (Join-Path $serviceRoot "start.ps1")
}
