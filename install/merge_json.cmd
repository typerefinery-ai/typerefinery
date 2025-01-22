@echo off
setlocal enabledelayedexpansion

rem Check if both source and target files are provided
if "%~1"=="" (
    echo Usage: merge_json.cmd "source.json" "target.json"
    echo.
    exit /b 1
)
if "%~2"=="" (
    echo Usage: merge_json.cmd "source.json" "target.json"
    echo.
    exit /b 1
)

rem Resolve absolute paths for source and target
for %%a in ("%~1") do set "source=%%~fa"
for %%a in ("%~2") do set "target=%%~fa"
set "temp=temp.json"

echo.
echo Resolved source file: "%source%"
echo Resolved target file: "%target%"
echo.

rem Generate timestamp in YYYYMMDDHHMMSS format
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "YYYY=%%c"
    set "MM=%%b"
    set "DD=%%a"
)
for /f "tokens=1-2 delims=:" %%a in ("%time%") do (
    set "HH=%%a"
    set "MIN=%%b"
)
set "SS=%time:~-2%"

rem Ensure hours are two digits
if 1%HH% LSS 20 set "HH=0%HH:~-1%"

rem Combine timestamp into a single string
set "timestamp=%YYYY%%MM%%DD%%HH%%MIN%%SS%"

rem Extract the directory of the target path
for %%d in ("%target%") do (
    set "targetDir=%%~dpd"
)

rem Ensure the directory for the target file exists
if not exist "!targetDir!" (
    echo Creating target directory: "!targetDir!"
    echo.
    mkdir "!targetDir!" || (
        echo Failed to create directory: "!targetDir!"
        echo.
        exit /b 1
    )
)

rem Check if the source file exists
if not exist "%source%" (
    echo ERROR: Source file "%source%" not found.
    echo Please check the source path.
    echo.
    exit /b 1
)

rem Check if the target file exists
if not exist "%target%" (
    echo Target file "%target%" not found. Copying source to target...
    echo.

    copy "%source%" "%target%" >nul
    if errorlevel 1 (
        echo ERROR: Failed to copy "%source%" to "%target%".
        echo Please check file permissions and paths.
        echo.
        exit /b 1
    )
    echo Source file successfully copied to target.
    echo.
    exit /b 0
)

rem Create the backup filename as <target>.timestamp.back
set "backup=%target%.%timestamp%.back"

echo Creating a backup of "%target%"...
echo.

copy "%target%" "%backup%" >nul
if errorlevel 1 (
    echo Failed to create backup of "%target%" as "%backup%".
    echo.
    exit /b 1
)
echo Backup created: "%backup%"
echo.

echo Extracting existing keys from "%target%"...
jq -r "keys[]" "%target%" > target_keys.txt 2>nul
if errorlevel 1 (
    echo Error extracting keys from "%target%". Please check the file format.
    echo.
    exit /b 1
)

echo Initializing a temporary file...
echo.
echo {} > "%temp%"

echo Processing each key-value pair in "%source%"...
echo.
for /f "delims=" %%o in ('jq -c "to_entries[]" "%source%"') do (
    set "entry=%%o"
    set "key="
    set "value="

    echo !entry! | jq -r ".key" > key.txt 2>nul
    set /p "key=" < key.txt

    echo !entry! | jq -c ".value" > value.txt 2>nul

    set "id="
    for /f "delims=" %%i in ('jq -r ".id" value.txt 2^>nul') do set "id=%%i"

    echo Checking if key "!key!" matches ID "!id!"...
    echo.
    if "!key!"=="!id!" (
        echo Key "!key!" matches ID, checking if it exists in the target...
        echo.
        findstr /x "!key!" target_keys.txt >nul
        if errorlevel 1 (
            echo Adding key "!key!" to the temp file...
            (
                echo { > pair.json
                echo ^{TAB}"!key!": >> pair.json
                type value.txt >> pair.json
                echo } >> pair.json
            )

            jq -s ".[0] * .[1]" "%temp%" pair.json > "%temp%.tmp" && move /Y "%temp%.tmp" "%temp%"
            del pair.json
            echo Key "!key!" added successfully.
        ) else (
            echo Key "!key!" already exists, skipping.
            echo.
        )
    ) else (
        echo Key "!key!" does not match its ID, skipping.
        echo.
    )
)

echo Merging updated objects into "%target%"...
echo.
jq --tab -s "add" "%target%" "%temp%" > "%target%.tmp" && move /Y "%target%.tmp" "%target%"

echo Cleaning up temporary files...
echo.
del key.txt value.txt target_keys.txt "%temp%"

echo All matching objects inserted successfully!
echo.

timeout 5

exit /b 0
