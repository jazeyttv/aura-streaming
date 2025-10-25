@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   AURA VERSION BUMP
echo   Automatic Cache Busting
echo ========================================
echo.

REM Get new version from user or auto-increment
if "%1"=="" (
    echo Current version: 2.0.0
    echo.
    set /p NEW_VERSION="Enter new version (e.g. 2.0.1) or press Enter to auto-increment: "
    if "!NEW_VERSION!"=="" (
        set NEW_VERSION=2.0.1
    )
) else (
    set NEW_VERSION=%1
)

echo.
echo Updating to version !NEW_VERSION!...
echo.

REM Update VersionChecker.js
echo [1/3] Updating VersionChecker.js...
powershell -Command "(Get-Content 'client\src\VersionChecker.js') -replace \"const APP_VERSION = '.*';\", \"const APP_VERSION = '!NEW_VERSION!';\" | Set-Content 'client\src\VersionChecker.js'"

REM Update package.json
echo [2/3] Updating package.json...
powershell -Command "(Get-Content 'client\package.json') -replace '\"version\": \".*\"', '\"version\": \"!NEW_VERSION!\"' | Set-Content 'client\package.json'"

REM Update index.html
echo [3/3] Updating index.html...
powershell -Command "(Get-Content 'client\public\index.html') -replace 'AURA - Live Streaming Platform v.*</title>', 'AURA - Live Streaming Platform v!NEW_VERSION!</title>' | Set-Content 'client\public\index.html'"

echo.
echo ========================================
echo   VERSION UPDATED TO !NEW_VERSION!
echo ========================================
echo.
echo Next steps:
echo   1. Run: .\FORCE_UPDATE_NOW.bat
echo   2. All users will auto-update on next visit
echo.
echo No cache clearing needed for users! ^_^
echo.
pause

