Param(
  [string]$APP_NAME = "Nginx",
  [string]$SERVICE_NAME = "nginx",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_EXECUTABLE_HOME = ( Join-Path "${SERVICE_HOME}" "${OS}" ),
  [string]$SERVICE_EXE = ( $IsWindows ? "nginx.exe" : "nginx" ),
  [string]$SERVICE_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "${SERVICE_BIN}" "${SERVICE_EXE}"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config"),
  [string]$SERVICE_LOG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "logs"),
  [switch]$SETUP = $false,
  [switch]$STOP = $false,
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
  printSectionLine "SERVICE_HOME: ${SERVICE_HOME}"
  printSectionLine "SERVICE_PROGRAM_PATH: ${SERVICE_PROGRAM_PATH}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}

Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"

  $SERVICE_CONFIG_PATH = $SERVICE_CONFIG_PATH.Replace(" ", "\ ")
  printSectionLine "SERVICE_CONFIG_PATH: ${SERVICE_CONFIG_PATH}"
  try {
    # Invoke-Expression -Command "$SERVICE_EXE -?"
    Invoke-Expression -Command "$SERVICE_EXE -p ""${SERVICE_CONFIG_PATH}"" -c ""${SERVICE_HOME}/config/conf/nginx.conf"" -e ""${SERVICE_LOG_PATH}/nginx-error.log"" "
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}



Function StopServer
{

  Set-Location -Path "${SERVER_HOME}"

  try {
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -p ${SERVICE_CONFIG_PATH} -s stop"
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}


Function StartSetup
{
  Set-Location -Path ${SERVICE_HOME}
  if ($IsWindows) {
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -v"
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -h"
  } else {
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -v"
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -h"
  }
  Set-Location -Path "${CURRENT_PATH}"
}

PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

SetPath "${SERVICE_EXECUTABLE_HOME}"
SetEnvPath "PATH" "${SERVICE_EXECUTABLE_HOME}"

$SERVICE_LOG_PATH_ESC = $SERVICE_LOG_PATH.Replace(" ", "\ ")

SetEnvVar "SERVICE_LOG_PATH_ESC" "${SERVICE_LOG_PATH_ESC}"

if ( $SETUP ) {
  StartSetup
} elseif ( $STOP ) {
  StopServer
} else {
  StartServer
}


