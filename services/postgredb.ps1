Param(
  [string]$APP_NAME = "PostgreDB",
  [string]$SERVICE_NAME = "postgredb",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "postgres"),
  [string]$SERVICE_SHELL_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "psql"),
  [string]$SERVICE_INIT_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "initdb"),
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "database" "db"),
  [string]$SERVICE_AUTH_USERNAME = "pgadmin",
  [string]$SERVICE_AUTH_PASSWORD = "pgadmin",
  [string]$SERVICE_DBINIT = "-D ${SERVICE_DATA_PATH} -U ${SERVICE_AUTH_USERNAME} --pwfile=${SERVICE_HOME}/config/default.password.txt",
  [string]$SERVICE_PLATFORM_ARCHIVE = "${OS}.zip",
  [string]$SERVICE_PLATFORM_HOME = "${OS}",
  [string]$SERVICE_PORT = 8500,
  [string]$SERVICE_HOST = "localhost",
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
  printSectionLine "SERVICE_DATA_PATH: ${SERVICE_DATA_PATH}"
  printSectionLine "ARCHIVE_HOME: ${ARCHIVE_HOME}"
  printSectionLine "ARCHIVE_PROGRAM: ${ARCHIVE_PROGRAM}"
  printSectionLine "ARCHIVE_PROGRAM_PATH: ${ARCHIVE_PROGRAM_PATH}"
  printSectionLine "SERVICE_AUTH_USERNAME: ${SERVICE_AUTH_USERNAME}"
  printSectionLine "SERVICE_AUTH_PASSWORD: ${SERVICE_AUTH_PASSWORD}"
  printSectionLine "SERVICE_HOST: ${SERVICE_HOST}"
  printSectionLine "SERVICE_PORT: ${SERVICE_PORT}"
  printSectionLine "SETUP: ${SETUP}"
  printSectionLine "DEBUG: ${DEBUG}"

}
Function StartServer
{

  Set-Location -Path "${SERVER_HOME}"
  try {
    # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --dbpath ${SERVICE_DB_PATH}"
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -D ${SERVICE_DATA_PATH} -h ${SERVICE_HOST} -p ${SERVICE_PORT}"
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

    Invoke-Expression -Command "${SERVICE_INIT_PATH} ${SERVICE_DBINIT}"
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
} else {
  printSectionBanner "Starting ${SERVICE_NAME} service"
  StartServer
}

