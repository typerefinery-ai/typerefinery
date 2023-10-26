Param(
  [string]$APP_NAME = "FastAPI",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "fastapi",
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_HOME_SCRIPTS = ( Join-Path "${PYTHON_HOME}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_HOME}" "${PYTHON_EXE}"),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${SERVER_HOME}" "__packages__"),
  [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  [string]$PYTHON_USERBASE_PATH_PACKAGES = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "site-packages"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$TYPEDB_HOST = "localhost",
  [string]$TYPEDB_DB = "typerefinery",
  [string]$TYPEDB_PORT = 8129,
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

  Set-Location -Path "${SERVER_HOME}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  printSectionLine "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  try {
    & Invoke-Expression -Command "${PYTHON} -m uvicorn --reload --reload-exclude ""req-*.py"" --host localhost --app-dir ""${SERVER_HOME}"" main:app"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function StartSample
{
  echo "${SERVICE_NAME} - StartSample"

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  printSectionLine "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  try {
    Invoke-Expression -Command "${PYTHON} -m http.server 8081 --directory "${SCRIPS_PATH}""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}


Function StartSetup
{
  echo "${SERVICE_NAME} - StartSetup"
  Set-Location -Path "${PYTHON_HOME}"
  try {
    Invoke-Expression -Command "${PYTHON} -m pip install --upgrade --use-pep517 --user -r ""${SERVER_REQUIREMENTS}"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function RunScriptBasic
{
  echo "${SERVICE_NAME} - RunScriptBasic"
  echo "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  echo "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  echo "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  try {
    Invoke-Expression -Command "${PYTHON} ${SERVICE_PATH}/scripts/G_to_WebCola.py ${TYPEDB_HOST} ${TYPEDB_PORT} ${TYPEDB_DB} ""match $a isa log, has logName 'L1'; $b isa event, has eventName $c; $d (owner: $a, item: $b) isa trace, has traceId $e, has index $f; offset 0;"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function RunScriptGroup
{
  echo "${SERVICE_NAME} - RunScriptGroup"
  echo "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  echo "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  echo "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  try {
    Invoke-Expression -Command "${PYTHON} ${SERVICE_PATH}/scripts/WebCola_Groups3.py ${TYPEDB_HOST} ${TYPEDB_PORT} ${TYPEDB_DB} ""match $a isa log, has logName 'L1'; $b isa event, has eventName $c; $d (owner: $a, item: $b) isa trace, has traceId $e, has index $f; offset 0;"""
    Invoke-Expression -Command "${PYTHON} ${SERVICE_PATH}/scripts/Collapse_Group.py ${SERVICE_PATH}/scripts/WebCola_Groups3.py.output ${SERVICE_PATH}/scripts/WebCola_Groups3.py.output.collapsed"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }


}

SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_HOME}" "${PYTHON_HOME_SCRIPTS}" "${PYTHON_USERBASE_PATH_SCRIPTS}" "${NODE_PATH}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvVar "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"
SetEnvVar "PYTHON_USERBASE_PATH" "${PYTHON_USERBASE_PATH}"
SetEnvVar "PYTHON_USERBASE_PATH_SCRIPTS" "${PYTHON_USERBASE_PATH_SCRIPTS}"
SetEnvVar "PYTHON_USERBASE_PATH_PACKAGES" "${PYTHON_USERBASE_PATH_PACKAGES}"



PrintInfo
if ( $INFO ) {
  StartInfo
} elseif ( $SETUP ) {
  StartSetup
} elseif ( $RUNSCRIPTBASIC ) {
  RunScriptBasic
} elseif ( $RUNSCRIPTGROUP ) {
  RunScriptGroup
} elseif ( $SAMPLE ) {
  StartSample
} else {
  StartServer
}


