@echo off

SET "USER_APP_PATH=%APPDATA%\Electron"
SET "USER_APP_LOG_PATH=%USER_APP_PATH%\logs"
SET "USER_APP_SERVICES_PATH=%USER_APP_PATH%\services"
SET "GIT_CLEAN_CHECK=git clean -xn services"
SET "GIT_CLEAN=git clean -xdf services"

if "%1" == "" goto missingargument

if "%1" == "clean" (
  goto startclean
)
if "%1" == "check" (
  goto startcheck
)

echo   Invalid argument: %1. Possible commands are:
echo   Check:           check [--help]
echo   Clean:           clean [--help]
goto exiterror

:missingargument

echo   Missing argument. Possible commands are:
echo   Check:           check [--help]
echo   Clean:           clean [--help]
goto exiterror


:startcheck

echo REMOVE FOLDERS FROM APPDATA:
if exist %USER_APP_LOG_PATH% (
  echo Would remove %USER_APP_LOG_PATH%
)
if exist %USER_APP_SERVICES_PATH% (
  echo Would remove %USER_APP_SERVICES_PATH%
)
echo REMOVE GENERATED FILES:
cd ..
git clean -xn services
goto exit

:startclean

echo REMOVE FOLDERS FROM APPDATA:
if exist %USER_APP_LOG_PATH% (
  echo Removing %USER_APP_LOG_PATH%
  rmdir /S /Q %USER_APP_LOG_PATH%
)
if exist %USER_APP_SERVICES_PATH% (
  echo Removing %USER_APP_SERVICES_PATH%
  rmdir /S /Q %USER_APP_SERVICES_PATH%
)
echo REMOVE GENERATED FILES:
cd ..
git clean -xdf services
goto exit



:exit
exit /b 0

:exiterror
exit /b 1
