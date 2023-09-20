Param(
  [string]$APP_NAME = "PostgreDB Admin",
  [string]$SERVICE_NAME = "postgredb-admin",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}"),
  [string]$PYTHON_PATH_SCRIPTS = ( Join-Path "${PYTHON_PATH}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$SERVICE_BIN_PROXY = ( Join-Path "${SERVER_HOME}" "main.py" ),
  [string]$SERVICE_BIN = ( Join-Path "${SERVER_HOME}" "__packages__" "pgadmin4" "pgAdmin4.py" ),
  [string]$SERVICE_BIN_RELATIVE = ( Join-Path "." "__packages__" "pgadmin4" "pgAdmin4.py" ),
  [string]$SERVICE_BIN_HOME = ( Join-Path "${SERVER_HOME}" "__packages__" "pgadmin4" ),
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "data"),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
  [string]$SCRIPS_PATH = ( Join-Path "${SERVER_HOME}" "scripts" ),
  [string]$SERVICE_HOST = "localhost",
  [string]$SERVICE_PORT = 8510,
  [string]$SERVICE_AUTH_USERNAME = "pgadmin@typerefinery.ai",
  [string]$SERVICE_AUTH_PASSWORD = "pgadmin",
  [string]$POSTGRE_AUTH_USERNAME = "pgadmin",
  [string]$POSTGRE_AUTH_PASSWORD = "pgadmin",
  [string]$POSTGRE_HOST = "localhost",
  [string]$POSTGRE_PORT = 8500,
  [string]$GUNICORN_LIMIT_REQUEST_LINE = 8190,
  [string]$GUNICORN_TIMEOUT = 300,
  [string]$GUNICORN_ACCESS_LOGFILE = "-",
  [string]$GUNICORN_THREADS = 25,
  [switch]$RUNSCRIPTBASIC = $false,
  [switch]$RUNSCRIPTGROUP = $false,
  [switch]$SAMPLE = $false,
  [switch]$SETUP = $false,
  [switch]$DEBUG = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Service ${SERVICE_NAME} config"

  printSectionLine "PYTHON_HOME: ${env:PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${env:PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_PATH_SCRIPTS: ${PYTHON_PATH_SCRIPTS}"

  printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "PYTHONEXECUTABLE: ${env:PYTHONEXECUTABLE}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}

Function StartServer
{
  echo "${SERVICE_NAME} - StartServer"

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  try {
    & Invoke-Expression -Command "${PYTHON} ${SERVICE_BIN_PROXY}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function StartSetup
{
  echo "${SERVICE_NAME} - StartSetup"
  Set-Location -Path "${PYTHON_HOME}"
  try {
    if ( $IsWindows ) {
      python get-pip.py
    }
    Invoke-Expression -Command "${PYTHON} -m pip install --ignore-installed --use-pep517 --user -r ""${SERVER_REQUIREMENTS}"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}" "${PYTHON_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"

SetEnvPath "DATA_DIR" "${SERVICE_DATA_PATH}"
SetEnvPath "SERVICE_HOST" "${SERVICE_HOST}"
SetEnvPath "SERVICE_PORT" "${SERVICE_PORT}"
SetEnvPath "PGADMIN_SERVER_MODE" "OFF"
SetEnvPath "DEFAULT_SERVER_PORT" "${POSTGRE_PORT}"



PrintInfo

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


