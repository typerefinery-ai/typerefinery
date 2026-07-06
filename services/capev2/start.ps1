param(
  [string]$Url
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$dotenv = Join-Path $serviceRoot ".env"
$template = Join-Path $serviceRoot ".env.template"

if (-not $Url -and (Test-Path $dotenv)) {
  $match = Select-String -Path $dotenv -Pattern "^CAPEV2_URL=(.+)$" | Select-Object -First 1
  if ($match) {
    $Url = $match.Matches[0].Groups[1].Value.Trim()
  }
}

if (-not $Url) {
  if (-not (Test-Path $dotenv)) {
    Copy-Item $template $dotenv -Force
  }
  throw "CAPEv2 is not a local bundled service. Set CAPEV2_URL in '$dotenv' or pass -Url for an externally deployed instance."
}

Write-Host "Opening external CAPEv2 instance at $Url"
Start-Process $Url
