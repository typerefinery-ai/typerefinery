Param(
  [string]$APP_NAME = "Python",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "_python",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}"),
  [string]$PYTHON_LIB = ( Join-Path "${PWD}" "_python" "${OS}" "lib"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "${OS}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "${OS}" "__packages__" ),
  [string]$SCRIPS_PATH = ( Join-Path "${SERVER_HOME}" "scripts" ),
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
  printSectionLine "PATH: ${PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "SERVER_REQUIREMENTS: ${SERVER_REQUIREMENTS}"

  printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}


Function StartSetup
{
  Set-Location -Path "${PYTHON_HOME}"
  try {
    which python
    if ( $IsWindows ) {
      Invoke-Expression -Command "${PYTHON} get-pip.py"
    }
    Invoke-Expression -Command "${PYTHON} -m pip install --ignore-installed --no-warn-script-location -r ${SERVER_REQUIREMENTS}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvPath "PYTHONUSERBASE" "${PYTHONPACKAGES}"

PrintInfo


if ( $SETUP ) {
  StartSetup
}


