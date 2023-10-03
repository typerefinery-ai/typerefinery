Param(
  [string]$APP_NAME = "Python",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "_python",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_PATH_SCRIPTS = ( Join-Path "${PYTHON_PATH}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_PATH}" "${PYTHON_EXE}"),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${PYTHON_PATH}" "user"),
  # [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  # [string]$PYTHON_USERBASE_PACKAGES = ( Join-Path "${PYTHON_PATH}" "Python311" "site-packages" ),
  # [string]$PYTHON_LIB = ( Join-Path "${PYTHON_PATH}" "lib"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "${OS}" "requirements.txt" ),
  [string]$TYPEDB_HOST = "localhost",
  [string]$TYPEDB_DB = "typerefinery",
  [string]$TYPEDB_PORT = 8129,
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

  printSectionLine "PYTHON_PATH: ${PYTHON_PATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${env:PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "SERVER_REQUIREMENTS: ${SERVER_REQUIREMENTS}"
  printSectionLine "SCRIPS_PATH: ${SCRIPS_PATH}"

  printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}


Function StartSetup
{
  Set-Location -Path "${PYTHON_HOME}"
  try {
    # which python
    if ( $IsWindows ) {
      Invoke-Expression -Command "${PYTHON} get-pip.py"
      Invoke-Expression -Command "${PYTHON} -m pip install --use-pep517 --user --ignore-installed --no-warn-script-location -r ${SERVER_REQUIREMENTS}"
    } else {
      Invoke-Expression -Command "${PYTHON} -m pip install --use-pep517 --user --ignore-installed --no-warn-script-location -r ${SERVER_REQUIREMENTS}"
    }
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartServer
{
  Set-Location -Path "${PYTHON_HOME}"
  try {
      Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig,site;print('PYTHON_USERBASE_PATH_SCRIPTS='+sysconfig.get_path('scripts',f'{os.name}_user'));print('PYTHON_SCRIPTS_PATH='+sysconfig.get_path('scripts',f'{os.name}'));print('PYTHON_USERBASE_PATH='+sysconfig.get_path('data',f'{os.name}_user'));print('PYTHON_USERBASE_PATH_SCRIPTS_PATH='+site.getusersitepackages())"""
      # Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig;print('PYTHON_SCRIPTS_PATH:'+sysconfig.get_path('scripts',f'{os.name}'))"""
      # Invoke-Expression -Command "${PYTHON} -m sysconfig"
      # Invoke-Expression -Command "${PYTHON} -m site"
      # Invoke-Expression -Command "${PYTHON} -m site --user-base --user-site"
      # Invoke-Expression -Command "${PYTHON} -c ""import site; print(site.getsitepackages())"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}" "${PYTHON_PATH_SCRIPTS}" #"${PYTHON_USERBASE_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvPath "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"

PrintInfo


if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


