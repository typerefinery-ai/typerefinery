Param(
  [string]$APP_NAME = "JupyterLab",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "jupyterlab",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}"),
  [string]$PYTHON_PATH_SCRIPTS = ( Join-Path "${PYTHON_PATH}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$NODE_VERSION = "v18.6.0",
  [string]$NODE_SERVICE_NAME = "_node",
  [string]$NODE_OS = ( $IsWindows ? "win" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$NODE_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$NODE_PLATFORM_HOME = "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}",
  [string]$NODE_PLATFORM_ARCHIVE = ( $IsWindows ? "${NODE_PLATFORM_HOME}.zip" : "${NODE_PLATFORM_HOME}.tar.gz" ) ,
  [string]$NODE_PATH = ( Join-Path "${PWD}" "${NODE_SERVICE_NAME}" $OS "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}"),
  [string]$NODE_PROGRAM_PATH = ( Join-Path "${NODE_PATH}" "node"),
  [string]$NPM_PROGRAM_PATH = ( Join-Path "${NODE_PATH}"  "npm"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
  [string]$SCRIPT_NAME = ( Join-Path "${SERVER_HOME}" "__packages__" "jupyter.py"),
  [string]$SCRIPS_PATH = ( Join-Path "${SERVER_HOME}" "scripts" ),
  [string]$SERVICE_WORKSPACE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "workspace"),
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "data"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config"),
  [string]$SERVICE_BIN_PROXY = ( Join-Path "${SERVER_HOME}" "main.py" ),
  [string]$SERVICE_PORT = 8888,
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

  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_PATH_SCRIPTS: ${PYTHON_PATH_SCRIPTS}"

  printSectionLine "env:PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "env:PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "env:PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "env:PYTHONEXECUTABLE: ${env:PYTHONEXECUTABLE}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}

Function StartServer
{
  echo "${SERVICE_NAME} - StartServer"

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVICE_WORKSPACE_PATH}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  printSectionLine "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PORT=${SERVICE_PORT}"
  try {
    # & Invoke-Expression -Command "${PYTHON} -m jupyter --paths"
    & Invoke-Expression -Command "${PYTHON} -m jupyter lab"

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

    # & Invoke-Expression -Command "${PYTHON} -c ""import os; os.system('node -v')"""
    & Invoke-Expression -Command "${PYTHON} -m pip install --target=""${PYTHONPACKAGES}"" -r ""${SERVER_REQUIREMENTS}"""
    & Invoke-Expression -Command "${PYTHON} -m jupyter lab build"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

SetPath "${PYTHON_HOME}" "${NODE_PATH}"
# SetEnvPath "PATH" "${PYTHON_PATH}" "${PYTHON_PATH_SCRIPTS}" "${NODE_PATH}"

# SetEnvPath "PYTHONPATH" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvPath "SCRIPT_NAME" "${SCRIPT_NAME}"
SetEnvPath "SERVER_HOME" "${SERVER_HOME}"
SetEnvPath "JUPYTERLAB_DIR" "${SERVICE_DATA_PATH}"
SetEnvPath "JUPYTER_CONFIG_DIR" "${SERVICE_CONFIG_PATH}"


PrintInfo

if ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


