@echo off
echo ==========================================
echo   AURA - Setup for Localhost Only
echo ==========================================
echo.
echo This configures for LOCALHOST access only
echo Works on your computer only
echo.
pause

echo.
echo [1/2] Configuring BACKEND for localhost...
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
echo PUBLIC_IP=localhost
echo.
echo # CORS Origins ^(comma-separated for multiple origins^)
echo CORS_ORIGIN=http://localhost:3000,http://10.8.0.250:3000,http://127.0.0.1:3000
echo.
echo # RTMP Configuration
echo RTMP_PORT=1935
echo HTTP_MEDIA_PORT=8888
echo API_SERVER=http://localhost:5000
echo.
echo # Frontend URL
echo FRONTEND_URL=http://localhost:3000
) > config.env

echo [2/2] Configuring FRONTEND for localhost...
cd /d "%~dp0\client"
(
echo # API Configuration for LOCALHOST
echo REACT_APP_API_URL=http://localhost:5000
echo REACT_APP_SOCKET_URL=http://localhost:5000
echo REACT_APP_MEDIA_URL=http://localhost:8888
) > .env

echo.
echo ==========================================
echo   Configuration Complete!
echo ==========================================
echo.
echo ACCESS:
echo   Computer: http://localhost:3000
echo.
echo NEXT STEPS:
echo   1. RESTART ALL SERVERS:
echo      Close all terminals
echo      Run: RESTART_CLEAN.bat
echo.
echo   2. STREAM FROM OBS:
echo      Server: rtmp://localhost:1935/live
echo.
echo ==========================================
pause

