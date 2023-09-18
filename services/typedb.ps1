Param(
  [string]$APP_NAME = "TypeDB",
  [string]$SERVICE_NAME = "typedb",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$SERVER_JAVAOPTS = "-Xms256m -Xmx1024m",
  [string]$SERVICE_PORT = "8729",
  [string]$CPU_ARCH = "x64",
  [string]$JAVA_HOME = ( Join-Path "${PWD}" "_java" "${OS}" ),
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" "$OS" "server"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" "$OS"),
  [string]$SERVICE_PLATFORM_HOME = "typedb-all-${NODE_OS}-2.22.0",
  [string]$SERVICE_PLATFORM_ARCHIVE = ( $IsWindows ? "${SERVICE_PLATFORM_HOME}.7z.001" : "${SERVICE_PLATFORM_HOME}.7z.001" ) ,
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "server" "data"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${SERVER_HOME}" "server" "conf" "config.yml" ),
  [string]$JAVA_PROGRAM_PATH = ( Join-Path "${JAVA_HOME}" "bin" "java.exe"),
  [string]$ARCHIVE_HOME = ( Join-Path "${PWD}" "_archive"),
  [string]$ARCHIVE_PROGRAM = ( $IsWindows ? "7za.exe" : "7zz" ),
  [string]$ARCHIVE_PROGRAM_PATH = ( Join-Path "${PWD}" "_archive" "$OS" "${ARCHIVE_PROGRAM}" ),
  [switch]$SETUP = $false,
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
  printSectionLine "SERVICE_DATA_PATH: ${SERVICE_DATA_PATH}"
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
  PrintInfo

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "lib" "*" )

    $COMMAND_START = "${JAVA_PROGRAM_PATH} ${SERVER_JAVAOPTS} -cp ""${env:G_CP}"" -D""typedb.dir=${SERVICE_HOME}"" ""com.vaticle.typedb.core.server.TypeDBServer"" --config=""${SERVICE_CONFIG_PATH}"" --storage.data=""${SERVICE_DATA_PATH}"" --server.address 0.0.0.0:${SERVICE_PORT}"
    # Invoke-Expression -Command "${JAVA_PROGRAM_PATH} --version"
    # echo $PWD
    echo $COMMAND_START
    Invoke-Expression -Command "${COMMAND_START}"
    # java ${env:SERVER_JAVAOPTS} -cp "${env:G_CP}" -D"typedb.dir=${SERVER_HOME}" "com.vaticle.typedb.core.server.TypeDBServer" --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartCluster
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "conf" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "common" "*" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "prod" "*" )

    java ${env:SERVER_JAVAOPTS} -cp "${env:G_CP}" -D"typedb.dir=${SERVICE_DATA_PATH}" "com.vaticle.typedb.core.server.TypeDBClusterServer"  --config=""${SERVICE_CONFIG_PATH}"" --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}


Function StartServerProd
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "server" "conf" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "common" "*" ) ( Join-Path "${SERVER_HOME}" "server" "lib" "prod" "*" )

    java ${env:SERVER_JAVAOPTS} -cp "${env:G_CP}" -D"typedb.dir=${SERVER_HOME}" "com.vaticle.typedb.core.server.TypeDBServer"  --config=""${SERVICE_CONFIG_PATH}"" --storage.data="${SERVICE_STORAGE_DATA_PATH}"

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartConsole
{

  Set-Location -Path "${SERVER_HOME}"
  try {

    SetEnvPath "G_CP" ( Join-Path "${SERVER_HOME}" "console" "lib" "*" )

    printSectionLine "G_CP: ${env:G_CP}"

    java ${env:CONSOLE_JAVAOPTS} -cp "${env:G_CP}" -D"org.jline.terminal.dumb=true"  -D"typedb.dir=${SERVER_HOME}" "com.vaticle.typedb.console.TypeDBConsole" --server 0.0.0.0:${SERVICE_PORT}

  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartSetup
{
  Set-Location -Path ${SERVER_HOME}
  if ($IsWindows) {
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -aoa ${SERVICE_PLATFORM_ARCHIVE}"
  } else {
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -aoa ${SERVICE_PLATFORM_ARCHIVE}"
    # Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -y ${SERVICE_PLATFORM_ARCHIVE}"
    # Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -aoa ${SERVICE_PLATFORM_HOME}.tar -bb3"
  }
  Set-Location -Path "${CURRENT_PATH}"
}


PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

#$SERVICE_DATA_PATH = GetAppDataPath

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

if ( $SETUP ) {
  StartSetup
} elseif ( $CONSOLE ) {
  StartConsole
} elseif ( $PROD ) {
  StartServerProd
} else {
  StartServer
}


