Function Get-DateStamp
{
  [Cmdletbinding()]
  [Alias("DateStamp")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$Text
  )

  return "{0:yyyyMMdd}-{0:HHmmss}" -f (Get-Date)

}

Function Get-TimeStamp
{
  [Cmdletbinding()]
  [Alias("TimeStamp")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$Text
  )

  return "{0:MM/dd/yy} {0:HH:mm:ss}" -f (Get-Date)

}

Function Get-LocalIP
{
  [Cmdletbinding()]
  [Alias("LocalIP")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$ITERFACE_NAME = "(Default Switch)",
    [string]$CONFIG_NAME = "IPv4 Address",
    [string]$IPCONFIG_COMMAND = "ipconfig",
    [string]$IPCONFIG_COMMAND_OUTPUT = "${LOG_PATH}\ipconfig.log"
  )

  Invoke-Expression -Command ${IPCONFIG_COMMAND} | Set-Content ${IPCONFIG_COMMAND_OUTPUT}

  # GET SECTION LINES
  $RESULT_INTERFACE = (Get-Content "$IPCONFIG_COMMAND_OUTPUT") | Select-String -SimpleMatch -Pattern "$ITERFACE_NAME" -Context 0,6 | Set-Content ${IPCONFIG_COMMAND_OUTPUT}
  # GET IP LINE
  $RESULT_INTERFACE = (Get-Content "$IPCONFIG_COMMAND_OUTPUT") | Select-String -SimpleMatch -Pattern "$CONFIG_NAME" | Set-Content ${IPCONFIG_COMMAND_OUTPUT}
  $IP_ADDRESS = (Get-Content "$IPCONFIG_COMMAND_OUTPUT").Split(":")[1].Trim()


  if ( [string]::IsNullOrEmpty($IP_ADDRESS) )
  {
    printSectionLine "COULD NOT FIND CURRENT IP ADDRESS"
    $IP_ADDRESS = "127.0.0.1"
  }

  return "$IP_ADDRESS"

}



Function Get-DefaultFromPom
{
  [Cmdletbinding()]
  [Alias("getDefaultFromPom")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$PARAM_NAME = $args[0],
    [string]$POM_FILE = $args[1]
  )

  return $POM_FILE_XML.project.properties["${PARAM_NAME}"].InnerText

}

Function Get-ParamOrDefault
{
  [Cmdletbinding()]
  [Alias("getParamOrDefault")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$PARAM = $args[0],
    [string]$PARAM_NAME = $args[1],
    [string]$POM_FILE = $args[3],
    [string]$DEFAULT_VALUE = "$(getDefaultFromPom "${PARAM_NAME}" "${POM_FILE}")"
  )

  if ( [string]::IsNullOrEmpty(${DEFAULT_VALUE}) )
  {
    printSectionLine "DEFAULT MISSING IN POM: $PARAM_NAME"
  } else {
    if ( [string]::IsNullOrEmpty(${PARAM}) )
    {
      return "${DEFAULT_VALUE}"
    } else {
      return ${PARAM}
    }
  }

}

Function Get-EvalMaven
{
  [Cmdletbinding()]
  [Alias("evalMaven")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$PARAM
  )

  return $(mvn help:evaluate -q -DforceStdout -D"expression=$PARAM")

}

Function Get-GitDir
{
  [Cmdletbinding()]
  [Alias("getGitDir")]
  param()
  return Resolve-Path (git rev-parse --git-dir) | Split-Path -Parent

}

Function Do-Debug
{
  [Cmdletbinding()]
  [Alias("debug")]
  [Alias("printSectionLine")]
  [Alias("printSectionBanner")]
  [Alias("printSectionStart")]
  [Alias("printSectionEnd")]
  [Alias("printSubSectionStart")]
  [Alias("printSubSectionEnd")]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$TEXT = $args[0],
    [string]$TYPE = $args[1]
  )

  # Save previous colors
  $previousForegroundColor = $host.UI.RawUI.ForegroundColor
  $previousBackgroundColor = $host.UI.RawUI.BackgroundColor

  if ( -not ([string]::IsNullOrEmpty(${LOG_FILE})) )
  {
    Write-Output "${TEXT}" | Add-Content -Path "${LOG_FILE}"
  }

  $TEXT_COLOR = $host.ui.rawui.ForegroundColor
  If ($TYPE -eq "error")
  {
    $TEXT_COLOR = "red"
  }
  elseif ($TYPE -eq "info")
  {
    $TEXT_COLOR = "blue"
  }
  elseif ($TYPE -eq "warn")
  {
    $TEXT_COLOR = "yellow"
  } else {
    $TEXT_COLOR = "gray"
  }

  $host.UI.RawUI.ForegroundColor = $TEXT_COLOR

  If ($MyInvocation.Line -like "*debug*")
  {
    Write-Output "${TEXT}"
  } elseif ($MyInvocation.Line -like "*printSectionLine *") {
    Write-Output $TEXT
  } elseif ($MyInvocation.Line -like "*printSectionStart *") {
    Write-Output "$("=" * 100)"
    Write-Output $([string]::Format("{0}{1,15}{2,-75}{1,6}{0}","||"," ",$TEXT))
    Write-Output "$("=" * 100)"
  } elseif ($MyInvocation.Line -like "*printSectionEnd *") {
    Write-Output "$("^" * 100)"
    Write-Output $([string]::Format("{0}{1,15}{2,-75}{1,6}{0}","||"," ",$TEXT))
    Write-Output "$("=" * 100)"
  } elseif ($MyInvocation.Line -like "*printSectionBanner *") {
    Write-Output "$("@" * 100)"
    Write-Output $([string]::Format("{0}{1,15}{2,-75}{1,8}{0}","@"," ",$TEXT))
    Write-Output "$("@" * 100)"
  } elseif ($MyInvocation.Line -like "*printSubSectionStart *") {
    Write-Output "$("~" * 100)"
    Write-Output $([string]::Format("{0}{1,15}{2,-75}{1,6}{0}"," ~"," ",$TEXT))
    Write-Output "$("~" * 100)"
  } elseif ($MyInvocation.Line -like "*printSubSectionEnd *") {
    Write-Output "$("^" * 100)"
    Write-Output $([string]::Format("{0}{1,15}{2,-75}{1,6}{0}"," ~"," ",$TEXT))
    Write-Output "$("~" * 100)"
  } else {
    Write-Output "${TEXT}"
  }

}


Function Do-DebugOn
{
  [Cmdletbinding()]
  [Alias("debugOn")]
  param()
  $script:DEBUG = $true

}


Function Do-DebugOff
{
  [Cmdletbinding()]
  [Alias("debugOff")]
  param()
  $script:DEBUG = $false

}


Function SetEnvVar
{
  [Cmdletbinding()]
  param
  (
    [Parameter(ValueFromPipeline)]
    [string]$VAR = $args[0],
    [string]$VALUE = $args[1]
  )

  printSectionLine "Setting $VAR to ${VALUE}"

  $CURRENT_VAR = ( Get-ChildItem env:${VAR} -ErrorAction SilentlyContinue )
  if ( $CURRENT_VAR ) {
    $CURRENT = ( Get-ChildItem env:${VAR} ).value

    printSectionLine "Current ${VAR}=$CURRENT"
  }
  New-Item env:${VAR} -Value "${VALUE}" -Force | Out-Null

  if ( $CURRENT_VAR ) {
    $CURRENT = ( Get-ChildItem env:${VAR} ).value

    printSectionLine "New ${VAR}=$CURRENT"
  }

}


Function SetPath
{
  # [Cmdletbinding()]
  # param
  # (
  #   [Parameter(ValueFromPipeline)]
  #   [string]$PATH = $args[0]
  # )

  $PATHS = $args[0..($args.Length-1)]
  $PATH_SEPARATOR = ( $IsWindows ? ";" : ":")
  $PATHS_STRING = $PATHS -join ( $IsWindows ? ";" : ":")

  printSectionLine "Setting PATH to ${PATHS_STRING}"
  printSectionLine "Current PATH to ${env:PATH}"

  $env:PATH = "${PATHS_STRING}"

  #SetEnvPath "PATH" $PATH

}


Function SetEnvPath
{
  $VAR = $args[0]
  $PATHS = $args[1..($args.Length-1)]
  $PATH_SEPARATOR = ( $IsWindows ? ";" : ":")
  $PATHS_STRING = ""
  $CURRENT_VAR = ( Get-ChildItem env:${VAR} -ErrorAction SilentlyContinue )

  $SKIP = $False

  if ( $CURRENT_VAR ) {
    $CURRENT = ( Get-ChildItem env:${VAR} ).value

    printSectionLine "Current ${VAR}=$CURRENT"

    # for each path in $PATHS check if not already in $CURRENT_VAR and join to $PATHS_STRING
    foreach ($APATH in $PATHS) {
      if ( $CURRENT -notlike "*${APATH}*" ) {
        # if ${PATHS_STRING} is empty, then don't add the separator
        if ( [string]::IsNullOrEmpty($PATHS_STRING) ) {
          $PATHS_STRING = "${APATH}"
        } else {
          $PATHS_STRING = "${PATHS_STRING}${PATH_SEPARATOR}${APATH}"
        }
      } else {
        printSectionLine "Skipping ${APATH} already in ${VAR}"
      }
    }

    # echo "PATHS_STRING ${PATHS_STRING}"

    # if $PATHS_STRING is empty, then skip
    if ( [string]::IsNullOrEmpty($PATHS_STRING) ) {
      $SKIP = $True
    }

  } else {
    $CURRENT = ""
    $PATHS_STRING = $PATHS -join ( $IsWindows ? ";" : ":")
  }

  if ( -not($SKIP) ) {
    printSectionLine "Setting ${VAR} to ${PATHS_STRING}"

    # if ${CURRENT} is empty, then don't add the separator
    if ( [string]::IsNullOrEmpty(${CURRENT}) ) {
      $NEW_UPDATE = "${PATHS_STRING}"
    } else {
      $NEW_UPDATE = "${PATHS_STRING}${PATH_SEPARATOR}${CURRENT}"
    }

    New-Item env:${VAR} -Value "${NEW_UPDATE}" -Force | Out-Null

    $NEW = ( Get-ChildItem env:${VAR} ).value
    printSectionLine "New ${VAR}=$NEW"
  } else {
    printSectionLine "Skipping update ${VAR} already set."
  }
}

Function TestPython {
  printSectionBanner "Python Test 1"
  python --version
  printSectionBanner "Python Test 2"
  python -c "print('Hello World')"
  printSectionBanner "Python Test 3"
  python -c "import sys; print(sys.path)"
  printSectionBanner "Python Test 4"
  python -c "import sys, ssl; print('{:s}\n{:s}'.format(sys.version, ssl.OPENSSL_VERSION))"
  printSectionBanner "Python Test 5"
  python -c "import ssl; print(ssl._ssl)"
  printSectionBanner "Python Pip Test 1"
  python -m pip --version
  printSectionBanner "Pip Test 1"
  pip --version
  printSectionBanner "Python Site Test 1"
  python -m site --user-site
  printSectionBanner "Python Site Test 2"
  python -c "import site; print(site.getsitepackages())"
}
