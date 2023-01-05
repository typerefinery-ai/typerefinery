Param(
  [string]$APP_NAME = "TypeRefinery",
  [string]$SERVICES_HOME = "services",
  [string]$SERVICE_NAME = "fastapi",
  [string]$OS = ( $IsWindows ? "windows" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}"),
  [string]$PYTHON_PATH = ( Join-Path "${PWD}" "_python" "${OS}" "bin"),
  [string]$PYTHON = ( Join-Path "${PWD}" "_python" "${OS}" "bin" "python"),
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "requirements.txt" ),
  [string]$PYTHONPACKAGES = ( Join-Path "${SERVER_HOME}" "__packages__" ),
  [string]$SCRIPS_PATH = ( Join-Path "${SERVER_HOME}" "scripts" ),
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

  printSectionBanner "Starting ${SERVICE_NAME} service"
}

Function StartServer
{

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  printSectionLine "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  python -m uvicorn --reload --reload-exclude "req-*.py" --host localhost --app-dir "${SERVER_HOME}" main:app
  cd -
}

Function StartSample
{

  if ($DEBUG) {
    TestPython
  }

  Set-Location -Path "${SERVER_HOME}"
  printSectionLine "Starting ${SERVICE_NAME} service in ${PWD}"
  printSectionLine "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  printSectionLine "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  python -m http.server 8081 --directory "${SCRIPS_PATH}"
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

Function RunScriptBasic
{
  echo "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  echo "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  echo "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  python ${SERVICE_PATH}/scripts/G_to_WebCola.py "localhost" 1729 "typerefinery" "match $a isa log, has logName 'L1'; $b isa event, has eventName $c; $d (owner: $a, item: $b) isa trace, has traceId $e, has index $f; offset 0;"

}

Function RunScriptGroup
{
  echo "${SERVICE_NAME} - SERVICE_DATA_PATH=${SERVICE_DATA_PATH}"
  echo "${SERVICE_NAME} - SERVICE_LOG_PATH=${SERVICE_LOG_PATH}"
  echo "${SERVICE_NAME} - SERVICE_PATH=${SERVICE_PATH}"
  python ${SERVICE_PATH}/scripts/WebCola_Groups3.py "localhost" 1729 "typerefinery" "match $a isa log, has logName 'L1'; $b isa event, has eventName $c; $d (owner: $a, item: $b) isa trace, has traceId $e, has index $f; offset 0;"
  python ${SERVICE_PATH}/scripts/Collapse_Group.py ${SERVICE_PATH}/scripts/WebCola_Groups3.py.output ${SERVICE_PATH}/scripts/WebCola_Groups3.py.output.collapsed

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
} elseif ( $RUNSCRIPTBASIC ) {
  RunScriptBasic
} elseif ( $RUNSCRIPTGROUP ) {
  RunScriptGroup
} elseif ( $SAMPLE ) {
  StartSample
} else {
  StartServer
}


