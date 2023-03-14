Param(
  [string]$APP_NAME = "BPMN Server",
  [string]$SERVICE_NAME = "bpmn-server",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$NODE_VERSION = "v18.6.0",
  [string]$NODE_SERVICE_NAME = "_node",
  [string]$NODE_OS = ( $IsWindows ? "win" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$NODE_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$NODE_EXT = ( $IsWindows ? ".exe" : "" ),
  [string]$NPM_EXT = ( $IsWindows ? ".cmd" : "" ),
  [string]$NODE_PLATFORM_HOME = "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}",
  [string]$NODE_PLATFORM_ARCHIVE = ( $IsWindows ? "${NODE_PLATFORM_HOME}.zip" : "${NODE_PLATFORM_HOME}.tar.gz" ) ,
  [string]$NODE_PROGRAM_PATH = ( Join-Path "${PWD}" "${NODE_SERVICE_NAME}" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}" "node$NODE_EXT" ),
  [string]$NPM_PROGRAM_PATH = ( Join-Path "${PWD}" "${NODE_SERVICE_NAME}" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}" "npm$NPM_EXT" ),
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_DATA_PATH = "./database",
  [string]$SERVICE_PORT = "8190",
  [switch]$SETUP = $false,
  [switch]$DEBUG = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Service ${SERVICE_NAME} config"

  printSectionLine "APP_NAME: ${APP_NAME}"
  printSectionLine "SERVICE_NAME: ${SERVICE_NAME}"
  printSectionLine "OS: ${OS}"
  printSectionLine "CPU_ARCH: ${CPU_ARCH}"
  printSectionLine "NODE_VERSION: ${NODE_VERSION}"
  printSectionLine "NODE_SERVICE_NAME: ${NODE_SERVICE_NAME}"
  printSectionLine "NODE_PLATFORM_HOME: ${NODE_PLATFORM_HOME}"
  printSectionLine "NODE_PLATFORM_ARCHIVE: ${NODE_PLATFORM_ARCHIVE}"
  printSectionLine "SERVICE_HOME: ${SERVICE_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "SERVICE_DATA_PATH: ${SERVICE_DATA_PATH}"
  printSectionLine "SERVICE_PORT: ${SERVICE_PORT}"
  printSectionLine "NODE_PROGRAM_PATH: ${NODE_PROGRAM_PATH}"
  printSectionLine "NPM_PROGRAM_PATH: ${NPM_PROGRAM_PATH}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}

Function StartServer
{

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  try {
    & ${NODE_PROGRAM_PATH} app
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}



Function StartSetup
{
  Set-Location -Path ${SERVICE_HOME}
  try {
    & "${NODE_PROGRAM_PATH}" -v
    & "${NPM_PROGRAM_PATH}" -v
    & "${NPM_PROGRAM_PATH}" install
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

SetEnvVar "SERVICE_DATA_PATH" "${SERVICE_DATA_PATH}"
SetEnvVar "SERVICE_PORT" "${SERVICE_PORT}"

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


