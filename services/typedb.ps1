Param(
  [string]$APP_NAME = "TypeRefinery",
  [string]$SERVICE_NAME = "typedb",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$JAVA_HOME = ( Join-Path "${PWD}" "_java" "${OS}"  "jre17"),
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" "$OS"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" "$OS"),
  [string]$JAVA_PROGRAM_PATH = ( Join-Path "${JAVA_HOME}" "bin" "java"),
  [switch]$CONSOLE = $false,
  [switch]$PROD = $false,
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
  printSectionLine "JAVA_HOME: ${JAVA_HOME}"
  printSectionLine "SERVICE_HOME: ${SERVICE_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "JAVA_PROGRAM_PATH: ${JAVA_PROGRAM_PATH}"
  printSectionLine "CONSOLE: ${CONSOLE}"
  printSectionLine "PROD: ${PROD}"
  printSectionLine "DEBUG: ${DEBUG}"

}

Function GetAppDataPath {

  # %APPDATA% on Windows
  # $XDG_CONFIG_HOME or ~/.config on Linux
  # ~/Library/Application Support on macOS

  $APPDATAPATH = ""

  if ( $IsWindows ) {
    $APPDATA = ( Get-ChildItem env:APPDATA -ErrorAction SilentlyContinue )
    if ( $APPDATA ) {
      $APPDATA = ( Get-ChildItem env:APPDATA ).value
    } else {
      $APPDATA = ( Join-Path "${HOME}" "AppData" "Roaming" )
    }
  } elseif ( $IsMacOS ) {
    $APPDATA = ( Join-Path "${HOME}" "Library" "Application Support" )
  } elseif ( $IsLinux ) {
    $XDG_CONFIG_HOME = ( Get-ChildItem env:XDG_CONFIG_HOME -ErrorAction SilentlyContinue )
    if ( $XDG_CONFIG_HOME ) {
      $APPDATA = ( Get-ChildItem env:XDG_CONFIG_HOME ).value
    } else {
      $APPDATA = ( Join-Path "${HOME}" ".config" )
    }
  }

  $APPDATAPATH = $APPDATA

  Return $APPDATAPATH
}

Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "conf" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "common" "*" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "prod" "*" )

    java ${SERVER_JAVAOPTS} -cp "${env:G_CP}" -D"typedb.dir=${SERVER_HOME}" "com.vaticle.typedb.core.server.TypeDBServer" --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartCluster
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "conf" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "common" "*" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "prod" "*" )

    java ${SERVER_JAVAOPTS} -cp "${G_CP}" -Dtypedb.dir="${SERVER_HOME}" com.vaticle.typedb.core.server.TypeDBClusterServer --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}


Function StartServerProd
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "conf" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "common" "*" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "prod" "*" )

    java ${SERVER_JAVAOPTS} -cp "${G_CP}" -Dtypedb.dir="${SERVER_HOME}" com.vaticle.typedb.core.server.TypeDBServer --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}





PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

$SERVICE_DATA_PATH = GetAppDataPath

if ( $PROD ) {
  $SERVICE_STORAGE_DATA_PATH = ${SERVICE_DATA_PATH}
} else {
  $SERVICE_STORAGE_DATA_PATH = ( Join-Path "${SERVER_HOME}" "server" "data" )
}

$NEW_PATH = ( Join-Path "${JAVA_HOME}" "bin")
SetPath $NEW_PATH

SetEnvVar "SERVICE_STORAGE_DATA_PATH" "${SERVICE_STORAGE_DATA_PATH}"
SetEnvVar "SERVER_HOME" "${SERVER_HOME}"
SetEnvVar "JAVA_HOME" "${JAVA_HOME}"

printSectionLine "SERVICE_STORAGE_DATA_PATH: ${env:SERVICE_STORAGE_DATA_PATH}"

Invoke-Expression -Command "java --version"

if ( $CONSOLE ) {
  StartConsole
} elseif ( $PROD ) {
  StartServerProd
} else {
  StartServer
}


