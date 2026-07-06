param(
  [string]$DeploymentRepoPath,
  [int]$FrontendPort = 4310,
  [int]$ApiPort = 4311,
  [int]$TaxiiPort = 4312,
  [switch]$WithTaxii
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

function Set-DotEnvValue([string]$FilePath, [string]$Key, [string]$Value) {
  $escapedKey = [Regex]::Escape($Key)
  if (-not (Test-Path $FilePath)) {
    Set-Content -Path $FilePath -Value "$Key=$Value"
    return
  }

  $content = Get-Content $FilePath -Raw
  if ($content -match "(?m)^$escapedKey=") {
    $content = [Regex]::Replace($content, "(?m)^$escapedKey=.*$", "$Key=$Value")
  }
  else {
    if ($content.Length -gt 0 -and -not $content.EndsWith([Environment]::NewLine)) {
      $content += [Environment]::NewLine
    }
    $content += "$Key=$Value" + [Environment]::NewLine
  }
  Set-Content -Path $FilePath -Value $content
}

function Ensure-SessionSecret([string]$FilePath) {
  if (-not (Test-Path $FilePath)) {
    throw "Could not find REST API env file at '$FilePath'."
  }

  $content = Get-Content $FilePath -Raw
  if ($content -match "(?m)^SESSION_SECRET=.+$") {
    return
  }

  $bytes = New-Object byte[] 48
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $secret = [Convert]::ToBase64String($bytes)
  Set-DotEnvValue $FilePath "SESSION_SECRET" $secret
}

Require-Command "docker"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$deploymentRoot = if ($DeploymentRepoPath) { (Resolve-Path $DeploymentRepoPath).Path } else { Join-Path $serviceRoot "deployment" }
$composeFile = Join-Path $deploymentRoot "compose.yaml"
$templateEnv = Join-Path $deploymentRoot "template.env"
$dotenv = Join-Path $deploymentRoot ".env"
$restApiTemplate = Join-Path $deploymentRoot "configs\\rest-api\\template.env"
$restApiEnv = Join-Path $deploymentRoot "configs\\rest-api\\.env"

if (-not (Test-Path $composeFile)) {
  throw "Could not find Attack Workbench deployment compose file at '$composeFile'. Build the service bundle first or pass -DeploymentRepoPath."
}

if (-not (Test-Path $dotenv) -and (Test-Path $templateEnv)) {
  Copy-Item $templateEnv $dotenv -Force
}

if (-not (Test-Path $restApiEnv) -and (Test-Path $restApiTemplate)) {
  Copy-Item $restApiTemplate $restApiEnv -Force
}

if (Test-Path $dotenv) {
  Set-DotEnvValue $dotenv "ATTACKWB_FRONTEND_HTTP_PORT" "$FrontendPort"
  Set-DotEnvValue $dotenv "ATTACKWB_RESTAPI_HTTP_PORT" "$ApiPort"
  Set-DotEnvValue $dotenv "ATTACKWB_TAXII_HTTP_PORT" "$TaxiiPort"
}

if (Test-Path $restApiEnv) {
  Ensure-SessionSecret $restApiEnv
}

Push-Location $deploymentRoot
try {
  if ($WithTaxii) {
    & docker compose --profile with-taxii up -d
  }
  else {
    & docker compose up -d
  }

  if ($LASTEXITCODE -ne 0) {
    throw "docker compose startup failed"
  }
}
finally {
  Pop-Location
}

Write-Host "Attack Workbench started."
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "REST API: http://localhost:$ApiPort"
if ($WithTaxii) {
  Write-Host "TAXII: http://localhost:$TaxiiPort"
}
