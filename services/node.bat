@echo off
SET "SERVICE_NAME=_node"
SET "NODE_HOME=%cd%\_node\v18.6.0"
SET "ARCHIVE_HOME=%cd%\_archive"
SET "SERVER_HOME=%cd%\%SERVICE_NAME%"
SET "PATH=%NODE_HOME%"

echo SERVER - SERVER_HOME=%SERVER_HOME%
echo SERVER - PATH=%PATH%

if "%1" == "" goto missingargument

if "%1" == "server"  goto startserver
if "%1" == "setup"  goto startsetup
if "%1" == "package"  goto startpackage

echo   Invalid argument: %1. Possible commands are:
echo   Server:          server [--help]
echo   Setup:           setup [--help]
goto exiterror

:missingargument

echo   Missing argument. Possible commands are:
echo   Server:         server [--help]
echo   Setup:          setup [--help]
goto exiterror


:startsetup

if exist %SERVER_HOME% (
  cd %SERVER_HOME%
  %ARCHIVE_HOME%\7za.exe -?
  %ARCHIVE_HOME%\7za.exe x -aoa node-v18.6.0-win-x64.zip

  goto exit
) else (
  echo Can't find server^.
  goto exiterror
)

:startserver

if exist %SERVER_HOME% (
  cd %SERVER_HOME%
  node.exe -v
  npm -v
  goto exit
) else (
  echo Can't find server^.
  goto exiterror
)


:exit
exit /b 0

:exiterror
exit /b 1
