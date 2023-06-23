Param(
  [string]$APP_NAME = "Traefik",
  [string]$SERVICE_NAME = "_traefik",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_EXE = ( $IsWindows ? "traefik.exe" : "traefik" ),
  [string]$SERVICE_CONFIG = ( Join-Path "${SERVICE_HOME}" "config" "dynamic" "dynamic.yml"),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "bin" "${SERVICE_EXE}"),
  [string]$SERVICE_EXE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config" "config"),
  [string]$SERVICE_PLATFORM_ARCHIVE = "${OS}.zip",
  [string]$SERVICE_PORT = 8100,
  [string]$SERVICE_PORT_HTTPS = 8101,
  [string]$SERVICE_PORT_DASHBOARD = 8102,
  [string]$SERVICE_PORT_CMS = 8113,
  [string]$ARCHIVE_HOME = ( Join-Path "${PWD}" "_archive"),
  [string]$ARCHIVE_PROGRAM = ( $IsWindows ? "7za.exe" : "7zz" ),
  [string]$ARCHIVE_PROGRAM_PATH = ( Join-Path "${PWD}" "_archive" "$OS" "${ARCHIVE_PROGRAM}" ),
  [switch]$SETUP = $false,
  [switch]$STOP = $false,
  [switch]$DEBUG = $false,
  # list of command line arguments for treaefik
  [string[]]$SERVICE_COMMAND_ARGS = @(
    "--log.level=DEBUG",
    "--providers.file.filename=${SERVICE_CONFIG}",
    "--api.insecure=true",
    "--api.dashboard=true",
    "--entryPoints.web.address="":${SERVICE_PORT}""",
    "--entryPoints.websecure.address="":${SERVICE_PORT_HTTPS}""",
    "--entryPoints.traefik.address="":${SERVICE_PORT_DASHBOARD}""",
    "--serversTransport.insecureSkipVerify=true",
    "--entryPoints.mongo.address=:${TRAEFIK_MONGO_PORT}",
    "--entryPoints.typedb.address=:${TRAEFIK_TYPEDB_PORT}"
    # "--certificatesresolvers.letsencrypt.acme.email=devops@typerefinery.ai",
    # "--certificatesresolvers.letsencrypt.acme.storage=${SERVICE_HOME}\\config\\acme.json",
    # "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
    # "--certificatesresolvers.letsencrypt.acme.httpchallenge=true",
    # "--certificatesresolvers.letsencrypt.acme.httpchallenge.entryPoint=web"
  )
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
  SetEnvVar "SERVICE_PORT" "${SERVICE_PORT}"
  SetEnvVar "CMS_PORT" "${SERVICE_PORT_CMS}"
  SetEnvVar "SERVICE_PORT_DASHBOARD" "${SERVICE_PORT_DASHBOARD}"
  SetEnvVar "TRAEFIK_PROVIDERS_FILE_FILENAME" ( Join-Path "${SERVICE_HOME}" "config" "dynamic" "dynamic.yml")
  SetEnvVar "CERT_FILE" ( Join-Path "${SERVICE_HOME}" "config" "certs" "cert.pem")
  SetEnvVar "CERT_KEY" ( Join-Path "${SERVICE_HOME}" "config" "certs" "privkey.pem")
  try {
    # if ($IsWindows) {
      printSectionLine "${SERVICE_PROGRAM_PATH} ${SERVICE_COMMAND_ARGS}"
      # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --configFile=${SERVICE_HOME}\\config\\traefik.yml"
      Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} ${SERVICE_COMMAND_ARGS}"
    # } else {
      # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --providers.file.filename=${SERVICE_HOME}/config/dynamic/dynamic.yml --configFile=${SERVICE_HOME}/config/traefik.yml"
    # }
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
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH}"
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}


Function StartSetup
{
  Set-Location -Path ${SERVICE_EXE_PATH}
  try {
    # extract archive
    if ($IsWindows) {
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x ${SERVICE_PLATFORM_ARCHIVE}"
    } else {
      Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -y ${SERVICE_PLATFORM_ARCHIVE}"
      Invoke-Expression -Command "chmod +x $SERVICE_PROGRAM_PATH"
    }
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
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


