@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   Kicky Streaming Platform Launcher
echo   Enhanced Edition with Real RTMP
echo ==========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js...
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo [2/4] Installing root dependencies...
    call npm install
) else (
    echo [2/4] Root dependencies already installed
)

if not exist "server\node_modules\" (
    echo [3/4] Installing server dependencies...
    cd server
    call npm install
    cd ..
) else (
    echo [3/4] Server dependencies already installed
)

if not exist "client\node_modules\" (
    echo [4/4] Installing client dependencies...
    cd client
    call npm install
    cd ..
) else (
    echo [4/4] Client dependencies already installed
)

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :gotip
)
:gotip

echo.
echo ==========================================
echo   Starting Kicky Platform...
echo ==========================================
echo.
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:5000
echo   Media Server: Will start in new window
echo.

if defined IP (
    echo   LOCAL NETWORK ACCESS:
    echo   Frontend:     http://!IP!:3000
    echo   Backend API:  http://!IP!:5000
    echo.
)

echo   RTMP Server:  rtmp://localhost:1935/live
if defined IP (
    echo   RTMP Public:  rtmp://!IP!:1935/live
)
echo.
echo ==========================================
echo.
echo [✓] Starting Backend + Frontend...
echo.

REM Start RTMP Media Server in new window
start "Kicky RTMP Server" cmd /k "cd server && npm run media-server"

timeout /t 2 /nobreak >nul

REM Start main application
npm run dev

pause

