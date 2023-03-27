Param(
  [string]$APP_NAME = "CMS",
  [string]$SERVICE_NAME = "cms",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "mongod"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config"),
  [string]$SERVICE_CACHE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "cache"),
  [string]$SERVICE_REPOSITORY_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "cache"),
  [string]$SERVICE_JAR_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "org.apache.sling.feature.launcher.jar"),
  [string]$SERVICE_FEATURE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "cache" "pl" "ds" "luna" "luna-distribution" "2.0.0" "luna-distribution-2.0.0-websight-cms-luna.slingosgifeature"),
  [string]$JAVA_OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$JAVA_SERVICE_NAME = "_java",
  [string]$JAVA_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$JAVA_PROGRAM_PATH = ( Join-Path "${PWD}" "${JAVA_SERVICE_NAME}" "${JAVA_OS}" "jre17" "bin" "java"),
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
  printSectionLine "SERVICE_PATH: ${SERVICE_PATH}"
  printSectionLine "SERVICE_PROGRAM_PATH: ${SERVICE_PROGRAM_PATH}"
  printSectionLine "SERVICE_CONFIG_PATH: ${SERVICE_CONFIG_PATH}"
  printSectionLine "JAVA_OS: ${JAVA_OS}"
  printSectionLine "JAVA_SERVICE_NAME: ${JAVA_SERVICE_NAME}"
  printSectionLine "JAVA_BIN: ${JAVA_BIN}"
  printSectionLine "JAVA_PROGRAM_PATH: ${JAVA_PROGRAM_PATH}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}

Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"
  try {
    # Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --add-opens java.base/java.lang=ALL-UNNAMED -XX:+UnlockDiagnosticVMOptions -jar org.apache.sling.feature.launcher.jar -c cache -CC ""org.apache.sling.commons.log.LogManager=MERGE_LATEST"" -p ""${SERVICE_CONFIG_PATH}"" -f cache/pl/ds/luna/luna-distribution/2.0.0/luna-distribution-2.0.0-websight-cms-luna.slingosgifeature"
    Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --add-opens java.base/java.lang=ALL-UNNAMED -XX:+UnlockDiagnosticVMOptions -jar ""${SERVICE_JAR_PATH}"" -v -c ""${SERVICE_CACHE_PATH}"" -u ""${SERVICE_REPOSITORY_PATH}"" -CC ""org.apache.sling.commons.log.LogManager=MERGE_LATEST"" -p ""${SERVICE_CONFIG_PATH}"" -f ""$SERVICE_FEATURE_PATH"""
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}




Function StartSetup
{
  Set-Location -Path ${SERVICE_PATH}
  if ($IsWindows) {
    Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --version"
    Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --add-opens java.base/java.lang=ALL-UNNAMED -XX:+UnlockDiagnosticVMOptions -jar ""${SERVICE_JAR_PATH}"" -h"
  } else {
    Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --version"
  }
  Set-Location -Path "${CURRENT_PATH}"
}

PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

if ( $SETUP ) {
  StartSetup
} elseif ( $STOP ) {
  StopServer
} else {
  StartServer
}


