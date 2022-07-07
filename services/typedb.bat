@echo off

SET "APP_NAME=TypeRefinery"
SET "SERVICES_HOME=services"
SET "SERVICE_NAME=typedb"
SET "PYTHON_HOME=%cd%\_python"
SET "SERVER_HOME=%cd%\%SERVICE_NAME%"
SET "JAVA_HOME=%cd%\_java\jre17"
SET "PATH=%JAVA_HOME%\bin"
SET "SERVICES_HOME_PROD=%APPDATA%\%APP_NAME%\%SERVICES_HOME%\%SERVICE_NAME%"
SET "SERVICES_DATA_PROD=%APPDATA%\%APP_NAME%\%SERVICES_HOME%\%SERVICE_NAME%"

echo %SERVICE_NAME% - SERVER_HOME=%SERVER_HOME%
echo %SERVICE_NAME% - JAVA_HOME=%JAVA_HOME%
echo %SERVICE_NAME% - PATH=%PATH%
echo %SERVICE_NAME% - SERVICES_HOME_PROD=%SERVICES_HOME_PROD%

@REM required memory = JVM memory + 2gb + 2*(configured db-caches in gb) + 0.5gb*CPUs

java --version

if "%1" == "" goto missingargument

if "%1" == "console" goto startconsole
if "%1" == "cluster" goto startcluster
if "%1" == "serverprod" (
  SET "SERVICE_DATA_PATH=%APPDATA%\%APP_NAME%\%SERVICES_HOME%\%SERVICE_NAME%"
  goto startserverprod
)
if "%1" == "server" (
  SET "SERVICE_DATA_PATH=%SERVER_HOME%"
  goto startserver
)

echo   Invalid argument: %1. Possible commands are:
echo   Server:          server [--help]
echo   Server PROD:     serverprod [--help]
echo   Cluster:         cluster [--help]
echo   Console:         console [--help]
goto exiterror

:missingargument

echo   Missing argument. Possible commands are:
echo   Server:          server [--help]
echo   Server PROD:     serverprod [--help]
echo   Cluster:         cluster [--help]
echo   Console:         console [--help]

goto exiterror

:startconsole

set "G_CP=%SERVER_HOME%\console\conf\;%SERVER_HOME%\console\lib\*"
if exist %SERVER_HOME%\console\ (
  java %CONSOLE_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%SERVER_HOME%" com.vaticle.typedb.console.TypeDBConsole
  goto exit
) else (
  echo Direcotory [%SERVER_HOME%\console\] is missing.
  goto exiterror
)

:startserver

IF exist "%SERVICE_DATA_PATH%" ( echo "%SERVICE_DATA_PATH%" exists ) ELSE ( mkdir "%SERVICE_DATA_PATH%" && echo "%SERVICE_DATA_PATH%" created)

set "G_CP=%SERVER_HOME%\server\conf\;%SERVER_HOME%\server\lib\common\*;%SERVER_HOME%\server\lib\prod\*"
if exist %SERVER_HOME%\server\ (
  java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%SERVER_HOME%" com.vaticle.typedb.core.server.TypeDBServer --storage.data="%SERVICE_DATA_PATH%/server/data"
  goto exit
) else (
  echo Direcotory [%SERVER_HOME%\server\] is missing.
  goto exiterror
)

:startcluster

set "G_CP=%SERVER_HOME%\server\conf\;%SERVER_HOME%\server\lib\common\*;%SERVER_HOME%\server\lib\prod\*"

if exist %SERVER_HOME%\server\ (
  java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%SERVER_HOME%" com.vaticle.typedb.cluster.server.TypeDBClusterServer
  goto exit
) else (
  echo Direcotory [%SERVER_HOME%\server\] is missing.
  goto exiterror
)

:startserverprod

IF exist "%SERVICE_DATA_PATH%" ( echo "%SERVICE_DATA_PATH%" exists ) ELSE ( mkdir "%SERVICE_DATA_PATH%" && echo "%SERVICE_DATA_PATH%" created)

set "G_CP=%SERVER_HOME%\server\conf\;%SERVER_HOME%\server\lib\common\*;%SERVER_HOME%\server\lib\prod\*"
if exist %SERVER_HOME%\server\ (
  java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%SERVER_HOME%" com.vaticle.typedb.core.server.TypeDBServer --storage.data="%SERVICE_DATA_PATH%"
  goto exit
) else (
  echo Direcotory [%SERVER_HOME%\server\] is missing.
  goto exiterror
)


:exit
exit /b 0

:exiterror
exit /b 1
