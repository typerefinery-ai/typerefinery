Param(
  [string]$APP_NAME = "MongoDB",
  [string]$SERVICE_NAME = "mongo",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "mongod"),
  [string]$SERVICE_SHELL_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "mongosh"),
  [string]$SERVICE_SCRIPT_DBINIT_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "dbinit.mongodb"),
  [string]$SERVICE_SCRIPT_STATUS_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "status.mongodb"),
  [string]$SERVICE_DB_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "database"),
  [string]$SERVICE_PLATFORM_ARCHIVE = "${OS}.zip",
  [string]$SERVICE_PLATFORM_HOME = "${OS}",
  [string]$SERVICE_AUTH_USERNAME = "mongoadmin",
  [string]$SERVICE_AUTH_PASSWORD = "mongoadmin",
  [string]$SERVICE_PORT = "8180",
  [string]$ARCHIVE_HOME = ( Join-Path "${PWD}" "_archive"),
  [string]$ARCHIVE_PROGRAM = ( $IsWindows ? "7za.exe" : "7zz" ),
  [string]$ARCHIVE_PROGRAM_PATH = ( Join-Path "${PWD}" "_archive" "$OS" "${ARCHIVE_PROGRAM}" ),
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
  printSectionLine "SERVICE_PLATFORM_ARCHIVE: ${SERVICE_PLATFORM_ARCHIVE}"
  printSectionLine "SERVICE_PLATFORM_HOME: ${SERVICE_PLATFORM_HOME}"
  printSectionLine "SERVICE_DB_PATH: ${SERVICE_DB_PATH}"
  printSectionLine "ARCHIVE_HOME: ${ARCHIVE_HOME}"
  printSectionLine "ARCHIVE_PROGRAM: ${ARCHIVE_PROGRAM}"
  printSectionLine "ARCHIVE_PROGRAM_PATH: ${ARCHIVE_PROGRAM_PATH}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}
Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"
  try {
    # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --dbpath ${SERVICE_DB_PATH}"
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --dbpath ${SERVICE_DB_PATH} --bind_ip_all --auth --port ${SERVICE_PORT}"
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
    Invoke-Expression -Command "${SERVICE_SHELL_PATH} --username ${SERVICE_AUTH_USERNAME} --password ${SERVICE_AUTH_PASSWORD} --port ${SERVICE_PORT} --quiet --eval 'db.shutdownServer()'"
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}




Function StartSetup
{
  Set-Location -Path ${SERVICE_HOME}
  try {

    # extract archive
    if ($IsWindows) {
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x ${SERVICE_PLATFORM_ARCHIVE}"
    } else {
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -y ${SERVICE_PLATFORM_ARCHIVE}"
    }

    # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --version"
    # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --help"

    Start-Process -FilePath "${SERVICE_PROGRAM_PATH}" -ArgumentList "--dbpath ${SERVICE_DB_PATH} --port ${SERVICE_PORT}" -NoNewWindow
    echo "Waiting for ${SERVICE_NAME} to start..."
    Start-Sleep -Seconds 5
    echo "..."
    echo "..."
    echo "..."
    echo "Setting debug level to 3 for network logs"
    echo "..."
    echo "..."
    echo "..."
    Invoke-Expression -Command "${SERVICE_SHELL_PATH} admin --port ${SERVICE_PORT} --quiet --eval ""db.setLogLevel(3, 'network')"""
    echo "..."
    echo "..."
    echo "..."
    echo "Creating user ${SERVICE_AUTH_USERNAME} with password ${SERVICE_AUTH_PASSWORD}"
    echo "..."
    echo "..."
    echo "..."
    Invoke-Expression -Command "${SERVICE_SHELL_PATH} admin --port ${SERVICE_PORT} --quiet --eval ""printjson(db.createUser({user: '${SERVICE_AUTH_USERNAME}',pwd: '${SERVICE_AUTH_PASSWORD}',roles: [{ role: 'root', db: 'admin' },]}))"""
    echo "..."
    echo "..."
    echo "..."
    echo "Shutting down ${SERVICE_NAME}"
    echo "..."
    echo "..."
    echo "..."
    Invoke-Expression -Command "${SERVICE_SHELL_PATH} admin --port ${SERVICE_PORT} --quiet --eval ""db.shutdownServer()"""

    # Invoke-Expression -Command "${SERVICE_SHELL_PATH} ${SERVICE_SCRIPT_DBINIT_PATH}"
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

PrintInfo


if ( $SETUP ) {
  printSectionBanner "Setting up ${SERVICE_NAME} service"
  StartSetup
} elseif ( $STOP ) {
  printSectionBanner "Stopping ${SERVICE_NAME} service"
  StopServer
} else {
  printSectionBanner "Starting ${SERVICE_NAME} service"
  StartServer
}

