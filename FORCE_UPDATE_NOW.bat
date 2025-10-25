@echo off
echo ========================================
echo   FORCE UPDATE - CLEAR ALL CACHES
echo   Version 2.0.0 - Chat Sync Fix
echo ========================================
echo.

echo [1/5] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Deleting React build cache...
if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache"
    echo   - Cleared React cache
) else (
    echo   - No cache found
)

echo.
echo [3/5] Deleting browser cache files...
if exist "client\build" (
    rmdir /s /q "client\build"
    echo   - Cleared build folder
)

echo.
echo [4/5] Starting backend server...
cd server
start "AURA Backend v2.0" cmd /k "node server.js"
cd ..
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Starting frontend (with fresh build)...
cd client
start "AURA Frontend v2.0" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   SERVERS STARTING!
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo   Network:  http://10.8.0.250:3000
echo.
echo ========================================
echo   IMPORTANT - ON YOUR PHONE:
echo ========================================
echo.
echo   1. Close browser completely
echo   2. Reopen browser
echo   3. Go to: http://10.8.0.250:3000
echo   4. Check version shows: v2.0
echo.
echo   OR use Private/Incognito mode
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause >nul

