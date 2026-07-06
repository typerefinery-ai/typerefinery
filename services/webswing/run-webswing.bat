@echo off
setlocal

set "SERVICE_ROOT=%~dp0"
set "ARCHIVE_ROOT=%SERVICE_ROOT%win32\webswing"
set "WEBSWING_INSTALL_DIR="
set "WEBSWING_JAVA=java"

for /d %%D in ("%ARCHIVE_ROOT%\*") do (
  if exist "%%~fD\webswing.bat" (
    set "WEBSWING_INSTALL_DIR=%%~fD"
    goto start
  )
)

echo Could not find extracted Webswing installation under "%ARCHIVE_ROOT%"
exit /b 1

:start
if defined GHIDRA_JAVA_EXECUTABLE (
  if exist "%GHIDRA_JAVA_EXECUTABLE%" (
    rem Prefer the Java executable discovered during Ghidra setup so Webswing and Ghidra stay aligned.
    set "WEBSWING_JAVA=%GHIDRA_JAVA_EXECUTABLE%"
  )
)

cd /d "%WEBSWING_INSTALL_DIR%"
"%WEBSWING_JAVA%" --add-opens=java.base/java.lang=ALL-UNNAMED -jar webswing-server.war -j jetty.properties -c webswing.config -pf webswing.properties -id typerefinery-webswing -s 0
