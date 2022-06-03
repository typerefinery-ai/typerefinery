@echo off

SET "SERVICE_NAME=fastapi"
SET "PYTHON_HOME=%cd%\_python"
SET "SERVER_HOME=%cd%\%SERVICE_NAME%"
SET "PATH=%cd%;%PYTHON_HOME%"
SET "PYTHONPACKAGES=%SERVER_HOME%\__packages__"
SET "PYTHONPATH=%cd%;%PYTHONPACKAGES%"

echo SERVER - PYTHON_HOME=%PYTHON_HOME%
echo SERVER - SERVER_HOME=%SERVER_HOME%
echo SERVER - PATH=%PATH%
echo SERVER - PYTHONPACKAGES=%PYTHONPACKAGES%
echo SERVER - PYTHONPATH=%PYTHONPATH%

python --version

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
  cd %PYTHON_HOME%
  python get-pip.py
  python -m pip install uvicorn[standard]
  python -m pip install --target=%PYTHONPACKAGES% -r %SERVER_HOME%\requirements.txt
  goto exit
) else (
  echo Can't find server^.
  goto exiterror
)

:startserver

if exist %SERVER_HOME% (
  python -I -m uvicorn main:app --reload --host localhost --app-dir %SERVER_HOME%
  goto exit
) else (
  echo Can't find server^.
  goto exiterror
)


:exit
exit /b 0

:exiterror
exit /b 1
