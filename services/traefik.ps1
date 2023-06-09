Param(
  [string]$APP_NAME = "Traefik",
  [string]$SERVICE_NAME = "_traefik",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_EXE = ( $IsWindows ? "traefik.exe" : "traefik" ),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "${OS}" "${SERVICE_EXE}"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config"),
  [string]$SERVICE_PORT = 8100,
  [string]$SERVICE_PORT_HTTPS = 8101,
  [string]$SERVICE_PORT_DASHBOARD = 8102,
  [string]$SERVICE_PORT_CMS = 8113,
  [switch]$SETUP = $false,
  [switch]$STOP = $false,
  [switch]$DEBUG = $false,
  # list of command line arguments for treaefik
  [string[]]$SERVICE_COMMAND_ARGS = @(
    "--log.level=DEBUG",
    "--providers.file.filename=${SERVICE_HOME}\\config\\dynamic\\dynamic.yml",
    "--api.insecure=true",
    "--api.dashboard=true",
    "--entryPoints.web.address="":${SERVICE_PORT}""",
    "--entryPoints.websecure.address="":${SERVICE_PORT_HTTPS}""",
    "--entryPoints.traefik.address="":${SERVICE_PORT_DASHBOARD}""",
    "--serversTransport.insecureSkipVerify=true"
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
  SetEnvVar "TRAEFIK_PROVIDERS_FILE_FILENAME" "${SERVICE_HOME}\\config\\dynamic\\dynamic.yml"
  SetEnvVar "CERT_FILE" "${SERVICE_HOME}\\config\\certs\\cert.pem"
  SetEnvVar "CERT_KEY" "${SERVICE_HOME}\\config\\certs\\privkey.pem"
  try {
    if ($IsWindows) {
      printSectionLine "${SERVICE_PROGRAM_PATH} ${SERVICE_COMMAND_ARGS}"
      # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --configFile=${SERVICE_HOME}\\config\\traefik.yml"
      Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} ${SERVICE_COMMAND_ARGS}"
    } else {
      Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --providers.file.filename=${SERVICE_HOME}/config/dynamic/dynamic.yml --configFile=${SERVICE_HOME}/config/traefik.yml"
    }
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
  Set-Location -Path ${SERVICE_HOME}
  if ($IsWindows) {
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --configFile=${SERVICE_HOME}\\traefik.yml"
  } else {
    Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} --configFile=${SERVICE_HOME}/traefik.yml"
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


