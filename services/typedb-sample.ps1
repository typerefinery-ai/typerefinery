Param(
  [string]$APP_NAME = "TypeDB Sample",
  [string]$SERVICE_NAME = "typedb-sample",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_HOME_SCRIPTS = ( Join-Path "${PYTHON_HOME}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_HOME}" "${PYTHON_EXE}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${SERVER_HOME}" "__packages__"),
  [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  [string]$PYTHON_USERBASE_PATH_PACKAGES = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "site-packages"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$SCRIPT_PATH = ( Join-Path "${SERVER_HOME}" "basic_upload.py" ),
  [switch]$SETUP = $false,
  [switch]$INFO = $false,
  [switch]$DEBUG = $false
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

Function StartSetup
{
  cd "${PYTHON_HOME}"
  try {
    if ( $IsWindows ) {
     python get-pip.py
    }
    pip.exe install --user -r "${SERVER_REQUIREMENTS}"
    python "${SCRIPT_PATH}"

  }
  finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_HOME}" "${PYTHON_HOME_SCRIPTS}" "${PYTHON_USERBASE_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvVar "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"

printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"

PrintInfo
if ( $INFO ) {
  StartInfo
} elseif ( $SETUP ) {
  StartSetup
} else {
  printSectionLine "Run setup if required."
}


