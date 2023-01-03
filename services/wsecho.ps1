Param(
  [string]$SERVICE_NAME = "wsecho",
  [string]$OS = ( $IsWindows ? "windows" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "bin"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "bin" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
  [switch]$SETUP = $false
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
  python -I -m uvicorn main:app --reload --host localhost --app-dir "${SERVER_HOME}"
}

Function StartSetup
{
  cd "${PYTHON_HOME}"
  try {
  # python get-pip.py
  python -m pip install uvicorn[standard]
  python -m pip install --target="${PYTHONPACKAGES}" -r "${SERVER_HOME}\requirements.txt"
  }
  finally {
    cd -
  }
}

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}"

# SetEnvPath "PYTHONPATH" "${PYTHONPACKAGES}" "${PYTHON}"
SetEnvPath "PYTHONPATH" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
# SetEnvPath "PYTHON_PATH" "${PYTHONPACKAGES}" "${PYTHON}"
# SetEnvPath "PYTHON_HOME" "${PYTHON_HOME}"

printSectionLine "PYTHONHOME ${env:PYTHONHOME}"
printSectionLine "PYTHONPATH ${env:PYTHONPATH}"

python --version
python -m pip debug
# python -m pip --version


# if ( $SETUP ) {
#   StartSetup
# } else {
#   StartServer
# }


