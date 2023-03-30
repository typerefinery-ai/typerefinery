@echo off

SET "USER_APP_PATH='%APPDATA%\TypeRefinery\Local Storage'"

echo REMOVING Local STORAGE:
if exist %USER_APP_PATH% (
  echo Would remove %USER_APP_PATH%
  rm -r %USER_APP_PATH%
)
goto exit

:exit
exit /b 0

:exiterror
exit /b 1
