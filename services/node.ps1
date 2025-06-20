Param(
  [string]$APP_NAME = "Node",
  [string]$SERVICE_NAME = "_node",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$NODE_VERSION = "v24.2.0",
  [string]$NODE_OS = ( $IsWindows ? "win" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$NODE_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$NODE_PLATFORM_HOME = "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}",
  [string]$NODE_PLATFORM_ARCHIVE = ( $IsWindows ? "${NODE_PLATFORM_HOME}.zip" : "${NODE_PLATFORM_HOME}.tar.gz" ) ,
  [string]$NODE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}" "node"),
  [string]$NPM_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}" "npm"),
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}"),
  [string]$ARCHIVE_HOME = ( Join-Path "${PWD}" "_archive"),
  [string]$ARCHIVE_PROGRAM = ( $IsWindows ? "7za.exe" : "7zz" ),
  [string]$ARCHIVE_PROGRAM_PATH = ( Join-Path "${PWD}" "_archive" "$OS" "${ARCHIVE_PROGRAM}" ),
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
  printSectionLine "NODE_PLATFORM_HOME: ${NODE_PLATFORM_HOME}"
  printSectionLine "NODE_PLATFORM_ARCHIVE: ${NODE_PLATFORM_ARCHIVE}"
  printSectionLine "SERVICE_HOME: ${SERVICE_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "NODE_PROGRAM_PATH: ${NODE_PROGRAM_PATH}"
  printSectionLine "NPM_PROGRAM_PATH: ${NPM_PROGRAM_PATH}"
  printSectionLine "ARCHIVE_HOME: ${ARCHIVE_HOME}"
  printSectionLine "ARCHIVE_PROGRAM: ${ARCHIVE_PROGRAM}"
  printSectionLine "ARCHIVE_PROGRAM_PATH: ${ARCHIVE_PROGRAM_PATH}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}

Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"
  Invoke-Expression -Command "${NODE_PROGRAM_PATH} -v"
  Invoke-Expression -Command "${NPM_PROGRAM_PATH} -v"
  Set-Location -Path "${CURRENT_PATH}"
}



Function StartSetup
{
  Set-Location -Path ${SERVICE_HOME}
  if ($IsWindows) {
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -aoa ${NODE_PLATFORM_ARCHIVE}"
  } else {
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -y ${NODE_PLATFORM_ARCHIVE}"
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -aoa ${NODE_PLATFORM_HOME}.tar -bb3"
  }
  Set-Location -Path "${CURRENT_PATH}"
}

PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


