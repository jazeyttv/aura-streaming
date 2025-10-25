@echo off
echo ==========================================
echo   Kicky Streaming Platform Launcher
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

echo Node.js is installed: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing root dependencies...
    call npm install
)

if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules\" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo ==========================================
echo   Starting Kicky Streaming Platform...
echo ==========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev

