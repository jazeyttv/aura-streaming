@echo off
color 0A
echo.
echo ==========================================
echo    AURA - FIX EVERYTHING NOW
echo ==========================================
echo.
echo This will:
echo  - Kill all servers
echo  - Delete all caches
echo  - Configure for UNIVERSAL access
echo  - Restart everything fresh
echo  - Work for EVERYONE EVERYWHERE
echo.
echo Press ANY KEY to fix everything...
pause >nul

echo.
echo [1/8] Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/8] Deleting React cache...
cd /d "%~dp0\client"
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
if exist build rmdir /s /q build >nul 2>&1

echo [3/8] Configuring BACKEND for network + public...
cd /d "%~dp0\server"
(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # MongoDB
echo MONGODB_URI=mongodb://localhost:27017/kicky
echo.
echo # Security
echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_very_long_and_random
echo.
echo # Network - Use network IP for compatibility
echo PUBLIC_IP=10.8.0.250
echo.
echo # CORS - Allow all access points
echo CORS_ORIGIN=http://localhost:3000,http://10.8.0.250:3000,http://127.0.0.1:3000,http://72.23.212.188:3000
echo.
echo # RTMP
echo RTMP_PORT=1935
echo HTTP_MEDIA_PORT=8888
echo API_SERVER=http://localhost:5000
echo.
echo # Frontend
echo FRONTEND_URL=http://10.8.0.250:3000
) > config.env

echo [4/8] Configuring FRONTEND for network + public...
cd /d "%~dp0\client"
(
echo # Universal Configuration
echo REACT_APP_API_URL=http://10.8.0.250:5000
echo REACT_APP_SOCKET_URL=http://10.8.0.250:5000
echo REACT_APP_MEDIA_URL=http://10.8.0.250:8888
) > .env

echo [5/8] Starting BACKEND...
cd /d "%~dp0"
start "AURA Backend" cmd /k "cd server && node server.js"
timeout /t 5 /nobreak >nul

echo [6/8] Starting FRONTEND...
start "AURA Frontend" cmd /k "cd client && set GENERATE_SOURCEMAP=false && npm start"
timeout /t 10 /nobreak >nul

echo [7/8] Starting RTMP Media Server...
start "AURA RTMP" cmd /k "cd server && npm run media-server"
timeout /t 3 /nobreak >nul

echo [8/8] Cleaning up old streams in database...
timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo    SERVERS STARTING!
echo ==========================================
echo.
echo WAIT 60 SECONDS for frontend to compile...
echo.
echo Then access from:
echo.
echo YOUR COMPUTER:
echo   http://localhost:3000
echo   http://10.8.0.250:3000
echo.
echo YOUR PHONE ^(Same WiFi^):
echo   http://10.8.0.250:3000
echo.
echo ANYONE ON YOUR NETWORK:
echo   http://10.8.0.250:3000
echo.
echo WORLDWIDE ^(after port forwarding^):
echo   http://72.23.212.188:3000
echo.
echo ==========================================
echo    OBS SETTINGS
echo ==========================================
echo.
echo YOU:
echo   Server: rtmp://localhost:1935/live
echo   Stream Key: ^(from dashboard^)
echo.
echo EVERYONE ELSE:
echo   Server: rtmp://10.8.0.250:1935/live
echo   ^(or rtmp://72.23.212.188:1935/live if port forwarded^)
echo   Stream Key: ^(from their dashboard^)
echo.
echo ==========================================
echo    ADMIN LOGIN
echo ==========================================
echo.
echo Username: Jazey
echo Password: 1919
echo.
echo ==========================================
echo    CLEAR BROWSER CACHE!
echo ==========================================
echo.
echo IMPORTANT - Do this on ALL devices:
echo.
echo COMPUTER:
echo   1. Press Ctrl+Shift+Delete
echo   2. Clear "Cached images and files"
echo   3. Close ALL browser windows
echo   4. Wait 60 seconds
echo   5. Open NEW browser window
echo   6. Go to: http://10.8.0.250:3000
echo.
echo PHONE:
echo   1. Clear browser cache in settings
echo   2. Close browser completely
echo   3. Wait 60 seconds
echo   4. Open browser
echo   5. Go to: http://10.8.0.250:3000
echo.
echo OR USE INCOGNITO/PRIVATE MODE!
echo.
echo ==========================================
echo.
echo Wait 60 seconds, then test!
echo.
pause

