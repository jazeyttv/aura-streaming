@echo off
echo ==========================================
echo   AURA - Local Network Access Setup
echo ==========================================
echo.
echo This will configure AURA for LOCAL NETWORK access
echo via IP: 10.8.0.250
echo.
echo Devices on your network can access:
echo   http://10.8.0.250:3000
echo.
pause

echo.
echo [1/2] Configuring backend for network IP...
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
echo # Network Configuration
echo PUBLIC_IP=10.8.0.250
echo.
echo # CORS Origins ^(comma-separated for multiple origins^)
echo CORS_ORIGIN=http://localhost:3000,http://10.8.0.250:3000,http://127.0.0.1:3000,http://72.23.212.188:3000
echo.
echo # RTMP Configuration
echo RTMP_PORT=1935
echo HTTP_MEDIA_PORT=8888
echo API_SERVER=http://localhost:5000
echo.
echo # Frontend URL
echo FRONTEND_URL=http://10.8.0.250:3000
) > config.env

echo [2/2] Configuring frontend for network IP...
cd /d "%~dp0\client"
(
echo # API Configuration for local network access
echo REACT_APP_API_URL=http://10.8.0.250:5000
echo REACT_APP_SOCKET_URL=http://10.8.0.250:5000
echo REACT_APP_MEDIA_URL=http://10.8.0.250:8888
) > .env

echo.
echo ==========================================
echo   Configuration Complete!
echo ==========================================
echo.
echo Network access URLs:
echo   Frontend:  http://10.8.0.250:3000
echo   Backend:   http://10.8.0.250:5000
echo   RTMP:      rtmp://10.8.0.250:1935/live
echo.
echo NEXT STEPS:
echo   1. Restart all servers:
echo      - Close all terminals
echo      - Run START_ALL.bat
echo      - Run START_RTMP.bat
echo   2. Access from any device on your network: http://10.8.0.250:3000
echo.
echo ==========================================
pause
