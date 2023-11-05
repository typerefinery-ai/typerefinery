Param(
  [string]$APP_NAME = "Localcert",
  [string]$SERVICE_NAME = "_localcert",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$SERVICE_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVICE_EXECUTABLE_HOME = ( Join-Path "${SERVICE_HOME}" "${OS}" ),
  [string]$SERVICE_EXE = ( $IsWindows ? "localcert.exe" : "localcert" ),
  [string]$SERVICE_MKCERT_EXE = ( $IsWindows ? "mkcert.exe" : "mkcert" ),
  [string]$SERVICE_PROGRAM_PATH = ( Join-Path "." "${OS}" "${SERVICE_EXE}"),
  [string]$SERVICE_MKCERT_PATH = ( Join-Path "." "${OS}" "${SERVICE_MKCERT_EXE}"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "." "data"),
  [string]$SERVICE_DATA_FILE_KEY = ( Join-Path "." "data" "mkcert.key"),
  [string]$SERVICE_DATA_FILE_CERT = ( Join-Path "." "data" "mkcert.pem"),
  [string]$SERVICE_DATA_FILE_PFX = ( Join-Path "." "data" "mkcert.pfx"),
  [string]$SERVICE_PORT = 8100,
  [string]$SERVICE_PORT_HTTPS = 8101,
  [string]$SERVICE_PORT_DASHBOARD = 8102,
  [string]$SERVICE_PORT_CMS = 8113,
  [switch]$SETUP = $false,
  [switch]$STOP = $false,
  [switch]$DEBUG = $false,
  # list of command line arguments for treaefik
  [string[]]$CERTS_DOMAINS = @(
    "*.typerefinery.localhost",
    "*.localhost"
  ),
  [string]$CERTS_PASSWORD = "typerefinery",
  [string]$SERVICE_OPENSSL_COMMAND ="openssl pkcs12 -export -out mkcert.pfx -in mkcert.pem -inkey mkcert.key -certfile rootCA.pem -passout pass:${CERTS_PASSWORD}",
  [string]$SERVICE_TEST_COMMAND ="test -f ${SERVICE_DATA_FILE_KEY} && exit 0; ",
  [string]$SERVICE_MKCERT_INSTALL_COMMAND ="${SERVICE_MKCERT_PATH} -install",
  [string]$SERVICE_MKCERT_PFX_COMMAND =" -pkcs12 -p12-file ${SERVICE_DATA_FILE_PFX} -client ${CERTS_DOMAINS}",
  [string]$SERVICE_MKCERT_ALL_COMMAND =" -key-file ${SERVICE_DATA_FILE_KEY} -cert-file ${SERVICE_DATA_FILE_CERT} -client ${CERTS_DOMAINS}"
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
  try {
    echo ${SERVICE_MKCERT_COMMAND}
    Invoke-Expression -Command "${SERVICE_MKCERT_EXE} ${SERVICE_MKCERT_PFX_COMMAND}"
    Invoke-Expression -Command "${SERVICE_MKCERT_EXE} ${SERVICE_MKCERT_ALL_COMMAND}"
    # Invoke-Expression -Command "${SERVICE_PROGRAM_PATH} -dataDir ${SERVICE_HOME}/data -acceptTerms -localCert ${SERVICE_HOME}/data/cert.pem -localKey ${SERVICE_HOME}/data/key.pem -forceRenew"
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
    Invoke-Expression -Command "${SERVICE_MKCERT_INSTALL_COMMAND}"
  } catch {
    printSectionLine "Error: ${_}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

PrintInfo

printSectionBanner "Starting ${SERVICE_NAME} service"

SetPath "${SERVICE_EXECUTABLE_HOME}"
SetEnvPath "PATH" "${SERVICE_EXECUTABLE_HOME}"

SetEnvVar "TRUST_STORES" "system,java,nss"
SetEnvVar "CAROOT" "${SERVICE_CONFIG_PATH}"

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


