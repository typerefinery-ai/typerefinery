param(
  [string]$DeploymentRepoPath,
  [switch]$WithTaxii
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$deploymentRoot = if ($DeploymentRepoPath) { (Resolve-Path $DeploymentRepoPath).Path } else { Join-Path $serviceRoot "deployment" }
$composeFile = Join-Path $deploymentRoot "compose.yaml"

if (-not (Test-Path $composeFile)) {
  throw "Could not find Attack Workbench deployment compose file at '$composeFile'."
}

Push-Location $deploymentRoot
try {
  if ($WithTaxii) {
    & docker compose --profile with-taxii down
  }
  else {
    & docker compose down
  }

  if ($LASTEXITCODE -ne 0) {
    throw "docker compose shutdown failed"
  }
}
finally {
  Pop-Location
}

Write-Host "Attack Workbench stopped."
