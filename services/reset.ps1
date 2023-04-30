Param(
  [string]$ELECTRON_APP_NAME = "Typerefinery",
  [string]$USER_APP_PATH = ( $IsWindows ? "${env:APPDATA}\${ELECTRON_APP_NAME}" : ( $IsMacOS ? "~/Library/Application Support/${ELECTRON_APP_NAME}" : "${env:XDG_CONFIG_HOME }/${ELECTRON_APP_NAME}") ),
  [string]$USER_APP_LOG_PATH = "${USER_APP_PATH}\logs",
  [string]$USER_APP_SERVICES_PATH = "${USER_APP_PATH}\Electron",
  [string]$GIT_CLEAN_CHECK = "git clean -xn services; git clean -xn logs",
  [string]$GIT_CLEAN = "git clean -xdf services; git clean -xdf logs",
  [string]$CURRENT_PATH = "${PWD}",
  [string]$OS = ( $IsWindows ? "win32" : ( $IsMacOS ? "darwin" : "linux" ) ),
  [switch]$CLEAN = $false,
  [switch]$DEBUG = $false
)

. "${PWD}\functions.ps1"

Function PrintInfo
{
  printSectionBanner "Reset Config"

  printSectionLine "ELECTRON_APP_NAME: ${ELECTRON_APP_NAME}"
  printSectionLine "USER_APP_PATH: ${USER_APP_PATH}"
  printSectionLine "USER_APP_LOG_PATH: ${USER_APP_LOG_PATH}"
  printSectionLine "USER_APP_SERVICES_PATH: ${USER_APP_SERVICES_PATH}"
  printSectionLine "GIT_CLEAN_CHECK: ${GIT_CLEAN_CHECK}"
  printSectionLine "GIT_CLEAN: ${GIT_CLEAN}"
  printSectionLine "CURRENT_PATH: ${CURRENT_PATH}"

}

Function StartCheck
{

  printSectionBanner "Reset Check"

  Set-Location -Path "${CURRENT_PATH}\.."
  try {
    Invoke-Expression -Command "${GIT_CLEAN_CHECK}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }

}

Function StartReset
{

  printSectionBanner "Reset"

  Set-Location -Path "${CURRENT_PATH}\.."
  try {
    Invoke-Expression -Command "${GIT_CLEAN}"
  } finally {
    Set-Location -Path "${CURRENT_PATH}"
  }



}

PrintInfo

if ( $CLEAN ) {
  StartReset
} else {
  StartCheck
}
