@echo off
echo ==========================================
echo   AURA - Public Internet Access Setup
echo ==========================================
echo.
echo This will configure AURA for PUBLIC internet access
echo via your public IP: 72.23.212.188
echo.
echo IMPORTANT: You must have port forwarding set up on your router:
echo   - Port 3000 (Frontend)
echo   - Port 5000 (Backend API)
echo   - Port 8888 (HLS Streaming)
echo   - Port 1935 (RTMP Streaming)
echo.
pause

echo.
echo [1/2] Configuring backend for public IP...
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
echo PUBLIC_IP=72.23.212.188
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
echo FRONTEND_URL=http://72.23.212.188:3000
) > config.env

echo [2/2] Configuring frontend for public IP...
cd /d "%~dp0\client"
(
echo # API Configuration for PUBLIC internet access
echo REACT_APP_API_URL=http://72.23.212.188:5000
echo REACT_APP_SOCKET_URL=http://72.23.212.188:5000
echo REACT_APP_MEDIA_URL=http://72.23.212.188:8888
) > .env

echo.
echo ==========================================
echo   Configuration Complete!
echo ==========================================
echo.
echo Public access URLs:
echo   Frontend:  http://72.23.212.188:3000
echo   Backend:   http://72.23.212.188:5000
echo   RTMP:      rtmp://72.23.212.188:1935/live
echo.
echo NEXT STEPS:
echo   1. Make sure ports 3000, 5000, 8888, 1935 are forwarded on your router
echo   2. Restart all servers:
echo      - Close all terminals
echo      - Run START_ALL.bat
echo      - Run START_RTMP.bat
echo   3. Access from anywhere: http://72.23.212.188:3000
echo.
echo ==========================================
pause

