Param(
  [string]$SERVICE_NAME = "wsecho",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
  [string]$SERVICE_PORT = "8113",
  [switch]$SETUP = $false,
  [switch]$DEBUG = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Service ${SERVICE_NAME} config"

  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "SERVICE_PORT: ${SERVICE_PORT}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}

Function StartServer
{

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  echo "Starting ${SERVICE_NAME} service in ${PWD}"
  try {
    python -m uvicorn main:app --reload --host localhost --port ${SERVICE_PORT} --app-dir "${SERVER_HOME}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function StartSetup
{
  cd "${PYTHON_HOME}"
  try {
    if ( $IsWindows ) {
     python get-pip.py
    }
    python -m pip install uvicorn
    python -m pip install --user -r "${SERVER_REQUIREMENTS}"
  }
  finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}"

SetEnvPath "PYTHONPATH" "${SERVER_HOME}" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvPath "PYTHONUSERBASE" "${PYTHONPACKAGES}"

printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


