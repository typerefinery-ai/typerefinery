param(
  [Parameter(Mandatory = $true)]
  [string]$ArchiveRoot,

  [Parameter(Mandatory = $true)]
  [string]$ConfigRoot
)

$ErrorActionPreference = "Stop"

$archiveRootResolved = (Resolve-Path $ArchiveRoot).Path
$configRootResolved = (Resolve-Path $ConfigRoot).Path

$installDir = Get-ChildItem -Path $archiveRootResolved -Directory | Where-Object {
  Test-Path (Join-Path $_.FullName "webswing.bat")
} | Select-Object -First 1

if (-not $installDir) {
  throw "Could not find extracted Webswing installation under '$archiveRootResolved'"
}

$baseConfigPath = Join-Path $configRootResolved "webswing.base.json"
$registrationsPath = Join-Path $configRootResolved "registrations"
$targetConfigPath = Join-Path $installDir.FullName "webswing.config"

if (-not (Test-Path $baseConfigPath)) {
  throw "Could not find base Webswing config at '$baseConfigPath'"
}

$mergedConfig = Get-Content -Path $baseConfigPath -Raw | ConvertFrom-Json -AsHashtable

if (Test-Path $registrationsPath) {
  Get-ChildItem -Path $registrationsPath -Filter *.json | Sort-Object Name | ForEach-Object {
    $registration = Get-Content -Path $_.FullName -Raw | ConvertFrom-Json -AsHashtable
    foreach ($key in $registration.Keys) {
      $mergedConfig[$key] = $registration[$key]
    }
  }
}

$json = $mergedConfig | ConvertTo-Json -Depth 12
Set-Content -Path $targetConfigPath -Value $json -Encoding utf8

Write-Host "WEBSWING_INSTALL_DIR=$($installDir.FullName)"
Write-Host "Configured Webswing at '$targetConfigPath'"
