@echo off

SET "TYPEDB_HOME=%cd%\typedb"
SET "JAVA_HOME=%cd%\_java\jre17"
SET "PATH=%JAVA_HOME%\bin"

echo TYPEDB - TYPEDB_HOME=%TYPEDB_HOME%
echo TYPEDB - JAVA_HOME=%JAVA_HOME%
echo TYPEDB - PATH=%PATH%

java --version

if "%1" == "" goto missingargument

if "%1" == "console" goto startconsole
if "%1" == "cluster" goto startcluster
if "%1" == "server"  goto startserver

echo   Invalid argument: %1. Possible commands are:
echo   Server:          typedb server [--help]
echo   Cluster:         typedb cluster [--help]
echo   Console:         typedb console [--help]
goto exiterror

:missingargument

 echo   Missing argument. Possible commands are:
 echo   Server:          typedb server [--help]
 echo   Cluster:         typedb cluster [--help]
 echo   Console:         typedb console [--help]

goto exiterror

:startconsole

set "G_CP=%TYPEDB_HOME%\console\conf\;%TYPEDB_HOME%\console\lib\*"
if exist %TYPEDB_HOME%\console\ (
  java %CONSOLE_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%TYPEDB_HOME%" com.vaticle.typedb.console.TypeDBConsole %2 %3 %4 %5 %6 %7 %8 %9
  goto exit
) else (
  echo Direcotory [%TYPEDB_HOME%\console\] is missing.
  goto exiterror
)

:startserver

set "G_CP=%TYPEDB_HOME%\server\conf\;%TYPEDB_HOME%\server\lib\common\*;%TYPEDB_HOME%\server\lib\prod\*"


if exist %TYPEDB_HOME%\server\ (
  java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%TYPEDB_HOME%" com.vaticle.typedb.core.server.TypeDBServer %2 %3 %4 %5 %6 %7 %8 %9
  goto exit
) else (
  echo Direcotory [%TYPEDB_HOME%\server\] is missing.
  goto exiterror
)

:startcluster

set "G_CP=%TYPEDB_HOME%\server\conf\;%TYPEDB_HOME%\server\lib\common\*;%TYPEDB_HOME%\server\lib\prod\*"

if exist %TYPEDB_HOME%\server\ (
  java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%TYPEDB_HOME%" com.vaticle.typedb.cluster.server.TypeDBClusterServer %2 %3 %4 %5 %6 %7 %8 %9
  goto exit
) else (
  echo Direcotory [%TYPEDB_HOME%\server\] is missing.
  goto exiterror
)


:exit
exit /b 0

:exiterror
exit /b 1
