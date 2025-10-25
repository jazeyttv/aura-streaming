@echo off
echo ==========================================
echo   FORCE REBUILD - Clear All Caches
echo ==========================================
echo.
echo This will:
echo   1. Kill all Node processes
echo   2. Delete React build cache
echo   3. Rebuild with fresh localhost config
echo.
pause

echo.
echo [1/6] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Deleting React cache...
cd /d "%~dp0\client"
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Cache deleted!
) else (
    echo No cache found.
)

echo [3/6] Verifying .env is correct...
cd /d "%~dp0\client"
(
echo # API Configuration for localhost
echo REACT_APP_API_URL=http://localhost:5000
echo REACT_APP_SOCKET_URL=http://localhost:5000
echo REACT_APP_MEDIA_URL=http://localhost:8888
) > .env
echo .env updated to localhost!

echo [4/6] Starting backend...
cd /d "%~dp0"
start "AURA Backend" cmd /k "cd server && node server.js"
timeout /t 3 /nobreak >nul

echo [5/6] Starting frontend (this will take a minute)...
start "AURA Frontend" cmd /k "cd client && set GENERATE_SOURCEMAP=false && npm start"
timeout /t 5 /nobreak >nul

echo [6/6] Starting media server...
start "AURA Media Server" cmd /k "cd server && npm run media-server"

echo.
echo ==========================================
echo   Servers Starting!
echo ==========================================
echo.
echo WAIT 60 SECONDS for frontend to rebuild...
echo.
echo Then:
echo   1. Close ALL browser windows
echo   2. Open NEW browser
echo   3. Go to: http://localhost:3000
echo   4. Login: Jazey / 1919
echo.
echo If STILL seeing 72.23.212.188:
echo   - Press Ctrl+Shift+Delete in browser
echo   - Clear "Cached images and files"
echo   - Close browser COMPLETELY
echo   - Reopen and try again
echo.
echo ==========================================
pause

