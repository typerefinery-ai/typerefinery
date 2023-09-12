Param(
  [string]$APP_NAME = "FastAPI",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "fastapi",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}"),
  [string]$PYTHON_PATH_SCRIPTS = ( Join-Path "${PYTHON_PATH}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
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

  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${PATH}"
  printSectionLine "PYTHONPACKAGES: ${PYTHONPACKAGES}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_PATH_SCRIPTS: ${PYTHON_PATH_SCRIPTS}"

  printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "PYTHONEXECUTABLE: ${env:PYTHONEXECUTABLE}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
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
    if ( $IsWindows ) {
      python get-pip.py
    }
    Invoke-Expression -Command "${PYTHON} -m pip install --use-pep517 --user --target=""${PYTHONPACKAGES}"" -r ""${SERVER_REQUIREMENTS}"""
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

# SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_PATH}" "${PYTHON_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${SERVER_HOME}" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvPath "PYTHONUSERBASE" "${PYTHONPACKAGES}"
SetEnvPath "PYTHONEXECUTABLE" "${PYTHON}"


PrintInfo

if ( $SETUP ) {
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


