param(
  [int]$Port = 4214,
  [string]$Host = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

$serviceRoot = (Resolve-Path $PSScriptRoot).Path
$appRoot = Join-Path $serviceRoot "app"
$runtimeServer = Join-Path $serviceRoot "runtime\\server.js"
$packageServer = Join-Path $serviceRoot "server.js"

if (-not (Test-Path $appRoot)) {
  throw "Could not find built app folder at '$appRoot'. Build or extract the packaged runtime first."
}

$serverPath = if (Test-Path $packageServer) { $packageServer } else { $runtimeServer }
if (-not (Test-Path $serverPath)) {
  throw "Could not find server entrypoint."
}

$env:APP_ROOT = $appRoot
$env:PORT = "$Port"
$env:HOST = $Host
$env:SERVICE_NAME = "d3fend"

Write-Host "Starting d3fend on http://${Host}:$Port"
& node $serverPath
