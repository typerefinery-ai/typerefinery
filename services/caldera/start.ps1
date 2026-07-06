param(
  [int]$Port = 4315
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

Require-Command "docker"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$dotenv = Join-Path $serviceRoot ".env"
$template = Join-Path $serviceRoot ".env.template"

if (-not (Test-Path $dotenv)) {
  Copy-Item $template $dotenv -Force
}

Set-DotEnvValue $dotenv "HOST_PORT" "$Port"

Push-Location $serviceRoot
try {
  & docker compose up -d
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose startup failed"
  }
}
finally {
  Pop-Location
}

Write-Host "Caldera started at http://localhost:$Port"
