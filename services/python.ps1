Param(
  [string]$APP_NAME = "Python",
  [string]$SERVICES_HOME = "services",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$SERVICE_NAME = "_python",
  [string]$SERVER_HOME = ( Join-Path "${PWD}" "${SERVICE_NAME}"),
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$PYTHON_BIN = ( $IsWindows ? "" : "bin" ),
  [string]$PYTHON_EXE = ( $IsWindows ? "python.exe" : "python" ),
  [string]$PYTHON_HOME = ( Join-Path "${PWD}" "_python" "${OS}" "${PYTHON_BIN}" "python"),
  [string]$PYTHON_HOME_SCRIPTS = ( Join-Path "${PYTHON_HOME}" "Scripts"),
  [string]$PYTHON = ( Join-Path "${PYTHON_HOME}" "${PYTHON_EXE}"),
  [string]$PYTHON_USERBASE_PATH = ( Join-Path "${PYTHON_HOME}" "__packages__"),
  [string]$PYTHON_USERBASE_PATH_SCRIPTS = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "Scripts"),
  [string]$PYTHON_USERBASE_PATH_PACKAGES = ( Join-Path "${PYTHON_USERBASE_PATH}" "Python311" "site-packages"),
  [string]$SERVER_REQUIREMENTS = ( Join-Path "${SERVER_HOME}" "${OS}" "requirements.txt" ),
  [string]$SERVICE_EXECUTABLE_HOME = ( Join-Path "${SERVER_HOME}" "${OS}" "python" ),
  [string]$SERVICE_PATH = ( Join-Path "${SERVER_HOME}" "${OS}" ),

  [string]$SERVICE_OS = ( $IsWindows ? "amd64" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [string]$SERVICE_PLATFORM_HOME = "python-3.11.5-embed-${SERVICE_OS}",
  [string]$SERVICE_PLATFORM_ARCHIVE = ( $IsWindows ? "${SERVICE_PLATFORM_HOME}.zip" : "${SERVICE_PLATFORM_HOME}.zip" ) ,

  [string]$ARCHIVE_HOME = ( Join-Path "${PWD}" "_archive"),
  [string]$ARCHIVE_PROGRAM = ( $IsWindows ? "7za.exe" : "7zz" ),
  [string]$ARCHIVE_PROGRAM_PATH = ( Join-Path "${PWD}" "_archive" "$OS" "${ARCHIVE_PROGRAM}" ),

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
  printSectionLine "PYTHON: ${PYTHON}"
  printSectionLine "PYTHON_HOME: ${PYTHON_HOME}"
  printSectionLine "SERVER_HOME: ${SERVER_HOME}"
  printSectionLine "PATH: ${env:PATH}"
  printSectionLine "PYTHONPATH: ${PYTHONPATH}"
  printSectionLine "SERVER_REQUIREMENTS: ${SERVER_REQUIREMENTS}"
  printSectionLine "SCRIPS_PATH: ${SCRIPS_PATH}"
  printSectionLine "PYTHON_USERBASE_PATH: ${PYTHON_USERBASE_PATH}"
  printSectionLine "PYTHON_USERBASE_PATH_SCRIPTS: ${PYTHON_USERBASE_PATH_SCRIPTS}"
  printSectionLine "PYTHON_USERBASE_PATH_PACKAGES: ${PYTHON_USERBASE_PATH_PACKAGES}"

  printSectionLine "PYTHONHOME: ${env:PYTHONHOME}"
  printSectionLine "PYTHONPATH: ${env:PYTHONPATH}"
  printSectionLine "PYTHONUSERBASE: ${env:PYTHONUSERBASE}"
  printSectionLine "PYTHON_HOME_SCRIPTS: ${PYTHON_HOME_SCRIPTS}"

  printSectionBanner "Starting ${SERVICE_NAME} service"
}


Function StartSetup
{
  Set-Location -Path "${PYTHON_HOME}"
  try {
    #Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} -?"
    Invoke-Expression -Command "${ARCHIVE_PROGRAM_PATH} x -opython -aoa ${SERVICE_PLATFORM_ARCHIVE}"

    Invoke-Expression -Command "echo ""Lib/site-packages"" >> ${SERVICE_EXECUTABLE_HOME}\\python311._pth"
    Invoke-Expression -Command "echo ""import site"" >> ${SERVICE_EXECUTABLE_HOME}\\python311._pth"

    # which python
    if ( $IsWindows ) {
      Invoke-Expression -Command "copy ${SERVICE_PATH}\\get-pip.py ${SERVICE_EXECUTABLE_HOME}"
      Invoke-Expression -Command "copy ${SERVICE_PATH}\\requirements.txt ${SERVICE_EXECUTABLE_HOME}"
      Invoke-Expression -Command "${PYTHON} get-pip.py"
      Invoke-Expression -Command "${PYTHON} -m pip install --user --ignore-installed --no-warn-script-location -r ${SERVER_REQUIREMENTS}"
    } else {
      Invoke-Expression -Command "${PYTHON} -m pip install --user --ignore-installed --no-warn-script-location -r ${SERVER_REQUIREMENTS}"
    }
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartServer
{
  Set-Location -Path "${PYTHON_HOME}"
  try {
      Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig,site;print('PYTHON_USERBASE_PATH_SCRIPTS='+sysconfig.get_path('scripts',f'{os.name}_user'));print('PYTHON_SCRIPTS_PATH='+sysconfig.get_path('scripts',f'{os.name}'));print('PYTHON_USERBASE_PATH='+sysconfig.get_path('data',f'{os.name}_user'));print('PYTHON_USERBASE_PATH_PACKAGES='+site.getusersitepackages())"""
      # Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig;print('PYTHON_SCRIPTS_PATH:'+sysconfig.get_path('scripts',f'{os.name}'))"""
      Invoke-Expression -Command "${PYTHON} -m sysconfig"
      # Invoke-Expression -Command "${PYTHON} -m site"
      # Invoke-Expression -Command "${PYTHON} -m site --user-base --user-site"
      # Invoke-Expression -Command "${PYTHON} -c ""import site; print(site.getsitepackages())"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}

Function StartInfo
{
  echo "${SERVICE_NAME} - StartInfo"
  Set-Location -Path "${PYTHON_HOME}"
  try {
    printSectionStart "VARS"
    Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig,site;print('PYTHON_USERBASE_PATH_SCRIPTS='+sysconfig.get_path('scripts',f'{os.name}_user'));print('PYTHON_SCRIPTS_PATH='+sysconfig.get_path('scripts',f'{os.name}'));print('PYTHON_USERBASE_PATH='+sysconfig.get_path('data',f'{os.name}_user'));print('PYTHON_USERBASE_PATH_PACKAGES='+site.getusersitepackages())"""
    # Invoke-Expression -Command "${PYTHON} -c ""import os,sysconfig;print('PYTHON_SCRIPTS_PATH:'+sysconfig.get_path('scripts',f'{os.name}'))"""
    printSectionStart "SYSCONFIG"
    Invoke-Expression -Command "${PYTHON} -m sysconfig"
    printSectionStart "SITE"
    Invoke-Expression -Command "${PYTHON} -m site"
    printSectionStart "SITE : USER BASE : USER SITE"
    Invoke-Expression -Command "${PYTHON} -m site --user-base --user-site"
    printSectionStart "SITE PACKAGES"
    Invoke-Expression -Command "${PYTHON} -c ""import site; print(site.getsitepackages())"""
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }
}


SetPath "${PYTHON_HOME}"
SetEnvPath "PATH" "${PYTHON_HOME_SCRIPTS}" "${PYTHON_USERBASE_PATH_SCRIPTS}"

SetEnvPath "PYTHONPATH" "${PYTHON_HOME}"
SetEnvPath "PYTHONHOME" "${PYTHON_HOME}"
SetEnvVar "PYTHONUSERBASE" "${PYTHON_USERBASE_PATH}"

PrintInfo
if ( $INFO ) {
  StartInfo
} elseif ( $SETUP ) {
  StartSetup
} else {
  StartServer
}


