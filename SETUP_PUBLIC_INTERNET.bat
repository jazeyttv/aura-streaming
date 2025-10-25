@echo off
echo ==========================================
echo   AURA - PUBLIC INTERNET ACCESS
echo ==========================================
echo.
echo This configures for WORLDWIDE ACCESS
echo Anyone can access from anywhere!
echo.
echo REQUIREMENTS:
echo   - Port forwarding MUST be set up first
echo   - Ports: 3000, 5000, 8888, 1935
echo   - Forward to: 10.8.0.250 (this computer)
echo.
echo Your public IP: 72.23.212.188
echo.
pause

echo.
echo [1/2] Configuring BACKEND for public access...
cd /d "%~dp0\server"
(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # MongoDB Configuration ^(optional - works without it^)
echo MONGODB_URI=mongodb://localhost:27017/kicky
echo.
echo # Security
echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_very_long_and_random
echo.
echo # Network Configuration - PUBLIC IP
echo PUBLIC_IP=72.23.212.188
echo.
echo # CORS Origins - Allow all access points
echo CORS_ORIGIN=http://localhost:3000,http://10.8.0.250:3000,http://127.0.0.1:3000,http://72.23.212.188:3000
echo.
echo # RTMP Configuration
echo RTMP_PORT=1935
echo HTTP_MEDIA_PORT=8888
echo API_SERVER=http://localhost:5000
echo.
echo # Frontend URL
echo FRONTEND_URL=http://72.23.212.188:3000
) > config.env

echo [2/2] Configuring FRONTEND for public access...
cd /d "%~dp0\client"
(
echo # API Configuration for PUBLIC INTERNET
echo REACT_APP_API_URL=http://72.23.212.188:5000
echo REACT_APP_SOCKET_URL=http://72.23.212.188:5000
echo REACT_APP_MEDIA_URL=http://72.23.212.188:8888
) > .env

echo.
echo ==========================================
echo   Configuration Complete!
echo ==========================================
echo.
echo WORLDWIDE ACCESS URLs:
echo   Anyone: http://72.23.212.188:3000
echo.
echo OBS Settings ^(from ANYWHERE^):
echo   Server: rtmp://72.23.212.188:1935/live
echo   Stream Key: ^(from dashboard^)
echo.
echo ==========================================
echo   CRITICAL - PORT FORWARDING REQUIRED!
echo ==========================================
echo.
echo You MUST forward these ports on your router:
echo.
echo   External Port  →  Internal IP      →  Internal Port
echo   -------------     ---------------      -------------
echo   3000           →  10.8.0.250       →  3000
echo   5000           →  10.8.0.250       →  5000
echo   8888           →  10.8.0.250       →  8888
echo   1935           →  10.8.0.250       →  1935
echo.
echo Protocol: TCP ^(or TCP/UDP^)
echo.
echo ==========================================
echo   NEXT STEPS:
echo ==========================================
echo.
echo 1. SET UP PORT FORWARDING ^(if not done^)
echo    - Access your router ^(usually 192.168.1.1^)
echo    - Find "Port Forwarding" or "NAT" settings
echo    - Add the 4 port rules above
echo    - Save and apply
echo.
echo 2. RESTART ALL SERVERS:
echo    - Close all terminals
echo    - Delete browser cache
echo    - Run: RESTART_CLEAN.bat
echo    - Wait 60 seconds
echo.
echo 3. TEST FROM PHONE ^(using mobile data, NOT WiFi^):
echo    - Turn OFF WiFi on phone
echo    - Use mobile data
echo    - Go to: http://72.23.212.188:3000
echo    - If it loads, port forwarding works!
echo.
echo 4. SHARE WITH FRIENDS:
echo    - Give them: http://72.23.212.188:3000
echo    - They create account
echo    - They stream from OBS anywhere!
echo.
echo ==========================================
echo   WHO CAN ACCESS:
echo ==========================================
echo.
echo ✓ You on this computer
echo ✓ Your phone on WiFi
echo ✓ Your phone on mobile data
echo ✓ Friends on their WiFi
echo ✓ Friend in Ohio
echo ✓ Anyone WORLDWIDE with internet!
echo.
echo ==========================================
pause

