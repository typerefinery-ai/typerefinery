Param(
  [string]$APP_NAME = "PostgreDB Admin",
  [string]$SERVICE_NAME = "postgredb-admin",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_HOME_SCRIPTS = ( Join-Path "${PYTHON_HOME}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_HOME}" "${PYTHON_EXE}"),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${SERVER_HOME}" "__packages__"),
  [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  [string]$PYTHON_USERBASE_PATH_PACKAGES = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "site-packages"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$SERVICE_BIN_PROXY = ( Join-Path "${SERVER_HOME}" "main.py" ),
  [string]$SERVICE_BIN = ( Join-Path "${PYTHON_USERBASE_PATH_PACKAGES}" "pgadmin4" "pgAdmin4.py" ),
  [string]$SERVICE_BIN_HOME = ( Join-Path "${PYTHON_USERBASE_PATH_PACKAGES}" "pgadmin4" ),
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "data"),
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
  [switch]$INFO = $false,
  [switch]$DEBUG = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Service ${SERVICE_NAME} config"

  printSectionLine "PYTHON_HOME: ${env:PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${env:PATH}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_HOME_SCRIPTS: ${PYTHON_HOME_SCRIPTS}"
  printSectionLine "PGADMIN_SCRIPT: ${SERVICE_BIN}"
  printSectionLine "PGADMIN_SCRIPT_HOME: ${SERVICE_BIN_HOME}"
  printSectionLine "PYTHON_USERBASE_PATH: ${PYTHON_USERBASE_PATH}"
  printSectionLine "PYTHON_USERBASE_PATH_SCRIPTS: ${PYTHON_USERBASE_PATH_SCRIPTS}"
  printSectionLine "PYTHON_USERBASE_PATH_PACKAGES: ${PYTHON_USERBASE_PATH_PACKAGES}"

  printSectionLine "env:PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "env:PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "env:PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "env:PYTHONEXECUTABLE: ${env:PYTHONEXECUTABLE}"
  printSectionLine "env:PATH: ${env:PATH}"

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
    # Invoke-Expression -Command "${PYTHON} -m pip install --ignore-installed --use-pep517 --user -r ""${SERVER_REQUIREMENTS}"""
    Invoke-Expression -Command "pip.exe install --upgrade --use-pep517 --user -r ""${SERVER_REQUIREMENTS}"""
    Invoke-Expression -Command "copy ${SERVER_HOME}\\config\\config_local.py ${SERVICE_BIN_HOME}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartInfo
{
  echo "${SERVICE_NAME} - StartInfo"
  Set-Location -Path "${PYTHON_HOME}"
  try {
    printSectionBanner "VARS"
    Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig,site;print('PYTHON_USERBASE_PATH_SCRIPTS='+sysconfig.get_path('scripts',f'{os.name}_user'));print('PYTHON_SCRIPTS_PATH='+sysconfig.get_path('scripts',f'{os.name}'));print('PYTHON_USERBASE_PATH='+sysconfig.get_path('data',f'{os.name}_user'));print('PYTHON_USERBASE_PATH_PACKAGES='+site.getusersitepackages())"""
    # Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig;print('PYTHON_SCRIPTS_PATH:'+sysconfig.get_path('scripts',f'{os.name}'))"""
    printSectionBanner "SYSCONFIG"
    Invoke-Expression -Command "${PYTHON} -m sysconfig"
    printSectionBanner "SITE"
    Invoke-Expression -Command "${PYTHON} -m site"
    printSectionBanner "SITE : USER BASE : USER SITE"
    Invoke-Expression -Command "${PYTHON} -m site --user-base --user-site"
    printSectionBanner "SITE PACKAGES"
    Invoke-Expression -Command "${PYTHON} -c ""import site; print(site.getsitepackages())"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_HOME}" "${PYTHON_HOME_SCRIPTS}" "${PYTHON_USERBASE_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvVar "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"

SetEnvPath "PGADMIN_SCRIPT" "${SERVICE_BIN}"
SetEnvPath "PGADMIN_SCRIPT_HOME" "${SERVICE_BIN_HOME}"


SetEnvPath "DATA_DIR" "${SERVICE_DATA_PATH}"
SetEnvPath "SERVICE_HOST" "${SERVICE_HOST}"
SetEnvPath "SERVICE_PORT" "${SERVICE_PORT}"
SetEnvPath "PGADMIN_SERVER_MODE" "OFF"
SetEnvPath "DEFAULT_SERVER_PORT" "${POSTGRE_PORT}"



PrintInfo
if ( $INFO ) {
  StartInfo
} elseif ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


