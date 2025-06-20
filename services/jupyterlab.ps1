Param(
  [string]$APP_NAME = "JupyterLab",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "jupyterlab",
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$CPU_ARCH = "x64",
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_HOME_SCRIPTS = ( Join-Path "${PYTHON_HOME}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_HOME}" "${PYTHON_EXE}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${SERVER_HOME}" "__packages__"),
  [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  [string]$PYTHON_USERBASE_PATH_PACKAGES = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "site-packages"),
  [string]$NODE_VERSION = "v24.2.0",
  [string]$NODE_SERVICE_NAME = "_node",
  [string]$NODE_OS = ( $IsWindows ? "win" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$NODE_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$NODE_EXE = ( $IsWindows ? "node.exe" : "node" ),
  [string]$NPM_EXE = ( $IsWindows ? "npm.exe" : "npm" ),
  [string]$NODE_PLATFORM_HOME = "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}",
  [string]$NODE_PLATFORM_ARCHIVE = ( $IsWindows ? "${NODE_PLATFORM_HOME}.zip" : "${NODE_PLATFORM_HOME}.tar.gz" ) ,
  [string]$NODE_PATH = ( Join-Path "${PWD}" "${NODE_SERVICE_NAME}" $OS "node" "node-${NODE_VERSION}-${NODE_OS}-${CPU_ARCH}" "${NODE_BIN}"),
  [string]$NODE_PROGRAM_PATH = ( Join-Path "${NODE_PATH}" "${NODE_EXE}"),
  [string]$NPM_PROGRAM_PATH = ( Join-Path "${NODE_PATH}"  "${NPM_EXE}"),
  [string]$SCRIPT_NAME = ( Join-Path "${SERVER_HOME}" "__packages__" "jupyter.py"),
  [string]$SCRIPS_PATH = ( Join-Path "${SERVER_HOME}" "scripts" ),
  [string]$SERVICE_WORKSPACE_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "workspaces"),
  [string]$SERVICE_NOTEBOOKS_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "notebooks"),
  [string]$SERVICE_JSWORK_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "jswork"),
  [string]$SERVICE_RUNTIME_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "runtime"),
  [string]$SERVICE_DATA_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "data"),
  [string]$SERVICE_CONFIG_PATH = ( Join-Path "${PWD}" "${SERVICE_NAME}" "config"),
  [string]$SERVICE_BIN_PROXY = ( Join-Path "${SERVER_HOME}" "main.py" ),
  [string]$SERVICE_PORT = 8888,
  [switch]$RUNSCRIPTBASIC = $false,
  [switch]$RUNSCRIPTGROUP = $false,
  [switch]$SAMPLE = $false,
  [switch]$SETUP = $false,
  [switch]$INFO = $false,
  [switch]$DEBUG = $false,
  [switch]$STOP = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Service ${SERVICE_NAME} config"

  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${PATH}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_HOME_SCRIPTS: ${PYTHON_HOME_SCRIPTS}"
  printSectionLine "PYTHON_USERBASE_PATH: ${PYTHON_USERBASE_PATH}"
  printSectionLine "PYTHON_USERBASE_PATH_SCRIPTS: ${PYTHON_USERBASE_PATH_SCRIPTS}"
  printSectionLine "PYTHON_USERBASE_PATH_PACKAGES: ${PYTHON_USERBASE_PATH_PACKAGES}"
  printSectionLine "NODE_PROGRAM_PATH: ${NODE_PROGRAM_PATH}"
  printSectionLine "NPM_PROGRAM_PATH: ${NPM_PROGRAM_PATH}"

  printSectionLine "env:PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "env:PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "env:PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "env:PYTHONEXECUTABLE: ${env:PYTHONEXECUTABLE}"
  printSectionLine "env:PATH: ${env:PATH}"

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
    & Invoke-Expression -Command "${PYTHON} -m jupyter lab --ServerApp.allow_remote_access=True --ServerApp.allow_origin=* --ServerApp.root_dir=${SERVICE_DATA_PATH} --no-browser --ServerApp.port=${SERVICE_PORT} --ServerApp.port_retries=0 --ServerApp.token='' --ServerApp.disable_check_xsrf=True --ServerApp.terminals_enabled=False --NotebookApp.terminals_enabled=False"
    # & Invoke-Expression -Command "ijsinstall --spec-path=full --working-dir=${SERVICE_JSWORK_PATH}"
    # & Invoke-Expression -Command "jupyter lab --show-config"
    # & Invoke-Expression -Command "jupyter kernelspec list"
    # & Invoke-Expression -Command "${PYTHON} -m jupyter --paths"
    # & Invoke-Expression -Command "jupyter lab list"
    # & Invoke-Expression -Command "jupyter lab list"
    # & Invoke-Expression -Command "jupyter lab stop"
    # & Invoke-Expression -Command "jupyter lab shutdown"
    # & Invoke-Expression -Command "jupyter lab stop 8888"
    # & Invoke-Expression -Command "jupyter lab stop 8892"
    # & Invoke-Expression -Command "jupyter notebook list"
    # & Invoke-Expression -Command "jupyter notebook stop 8888"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}


Function StopServer
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
    & Invoke-Expression -Command "jupyter lab stop"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function StartSetup
{
  echo "${SERVICE_NAME} - StartSetup"
  Set-Location -Path "${PYTHON_HOME}"
  try {
    Invoke-Expression -Command "pip.exe install --upgrade --use-pep517 --user -r ""${SERVER_REQUIREMENTS}"""
    Invoke-Expression -Command "pip.exe uninstall -y terminado"
    Invoke-Expression -Command "${PYTHON} -m site"
    # & Invoke-Expression -Command "${PYTHON} -c ""import os; os.system('node -v')"""
    # & Invoke-Expression -Command "${PYTHON} -m pip install --user -r ""${SERVER_REQUIREMENTS}"""
    printSectionBanner "Build JupyterLab"
    & Invoke-Expression -Command "${PYTHON} -m jupyter lab build"
    printSectionBanner "NPM Install iJavascript"
    & Invoke-Expression -Command "npm install -g ijavascript"
    printSectionBanner "Install iJavascript Kernel"
    & Invoke-Expression -Command "ijsinstall --install=local --spec-path=full --working-dir=${SERVICE_JSWORK_PATH}"
    printSectionBanner "List JupyterLab Kernel"
    & Invoke-Expression -Command "jupyter kernelspec list"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}



# SetPath "${PYTHON_HOME}" "${PYTHON_HOME_SCRIPTS}" "${NODE_PATH}"

SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_HOME}" "${PYTHON_HOME_SCRIPTS}" "${PYTHON_USERBASE_PATH_SCRIPTS}" "${NODE_PATH}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvVar "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"

# SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
# SetEnvPath "SCRIPT_NAME" "${SCRIPT_NAME}"
SetEnvPath "SERVER_HOME" "${SERVER_HOME}"
SetEnvPath "JUPYTERLAB_DIR" "${SERVICE_DATA_PATH}"
SetEnvPath "JUPYTER_DATA_DIR" "${SERVER_HOME}"
SetEnvPath "JUPYTER_CONFIG_DIR" "${SERVICE_CONFIG_PATH}"
SetEnvPath "JUPYTERLAB_NOTEBOOKS_DIR" "${SERVICE_NOTEBOOKS_PATH}"
SetEnvPath "JUPYTER_RUNTIME_DIR" "${SERVICE_RUNTIME_PATH}"

PrintInfo
if ( $INFO ) {
  StartInfo
} elseif ( $SETUP ) {
  StartSetup
} elseif ( $STOP ) {
  StopSetup
} else {
  StartServer
}


