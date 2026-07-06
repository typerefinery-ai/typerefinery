$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path

Push-Location $serviceRoot
try {
  & docker compose down
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose shutdown failed"
  }
}
finally {
  Pop-Location
}

Write-Host "Caldera stopped."
