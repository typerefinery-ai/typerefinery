Param(
  [string]$SERVICE_NAME = "wsecho",
  [string]$OS = ( $IsWindows ? "windows" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "bin"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "bin" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
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

  printSectionBanner "Starting ${SERVICE_NAME} service"
}

Function StartServer
{

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  echo "Starting ${SERVICE_NAME} service in ${PWD}"
  python -m uvicorn main:app --reload --host localhost --app-dir "${SERVER_HOME}"
  cd -
}

Function StartSetup
{
  cd "${PYTHON_HOME}"
  try {
    if ( $IsWindows ) {
     python get-pip.py
    }
    python -m pip install uvicorn
    python -m pip install --target="${PYTHONPACKAGES}" -r "${SERVER_REQUIREMENTS}"
  }
  finally {
    cd -
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


