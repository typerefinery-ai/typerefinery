@echo off
SET "SERVICE_NAME=totaljs-messageservice"
SET "NODE_HOME=%cd%\_node\node-v18.6.0-win-x64"
SET "SERVER_HOME=%cd%\%SERVICE_NAME%"
SET "PATH=%NODE_HOME%"
SET "SERVICE_DATA_PATH=./database"
SET "SERVICE_PORT=8112"

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
  node -v
  npm -v
  npm install total4
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
  echo SERVICE_DATA_PATH - SERVICE_DATA_PATH=%SERVICE_DATA_PATH%
  echo SERVICE_PATH - SERVICE_PORT=%SERVICE_PORT%
  npm start
  goto exit
) else (
  echo Can't find server^.
  goto exiterror
)


:exit
exit /b 0

:exiterror
exit /b 1
