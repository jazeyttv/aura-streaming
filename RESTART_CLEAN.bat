@echo off
echo ==========================================
echo   AURA - Clean Restart
echo ==========================================
echo.
echo This will:
echo   1. Kill all Node.js processes
echo   2. Clear port locks
echo   3. Restart all servers
echo.
pause

echo.
echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Clearing port locks...
netsh int ipv4 reset >nul 2>&1
timeout /t 1 /nobreak >nul

echo [3/3] Starting servers...
echo.
echo Starting backend + frontend...
start "AURA Backend + Frontend" cmd /k "cd /d %~dp0 && START_ALL.bat"

timeout /t 5 /nobreak >nul

echo Starting media server...
start "AURA Media Server" cmd /k "cd /d %~dp0 && START_RTMP.bat"

echo.
echo ==========================================
echo   Servers are starting!
echo ==========================================
echo.
echo Wait 30 seconds, then access:
echo   Local:   http://localhost:3000
echo   Network: http://10.8.0.250:3000
echo   Phone:   http://10.8.0.250:3000
echo.
echo Login: Jazey / 1919
echo.
echo ==========================================
pause

