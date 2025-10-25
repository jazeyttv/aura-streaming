@echo off
echo ========================================
echo  Setting Up Network IP Configuration
echo ========================================
echo.

REM Create client .env file with network IP
cd client
(
echo # API Configuration - Use your local network IP
echo REACT_APP_API_URL=http://10.8.0.250:5000
echo REACT_APP_SOCKET_URL=http://10.8.0.250:5000
echo REACT_APP_MEDIA_URL=http://10.8.0.250:8888
) > .env

echo ✅ Created client/.env with network IP configuration
echo.
echo ========================================
echo  Configuration Complete!
echo ========================================
echo.
echo Your app is now configured for network access at:
echo   Frontend: http://10.8.0.250:3000
echo   Backend:  http://10.8.0.250:5000
echo   RTMP:     rtmp://10.8.0.250:1935/live
echo.
echo Next Steps:
echo 1. Run START_ALL.bat to restart services
echo 2. Access from any device: http://10.8.0.250:3000
echo 3. Use RTMP URL in OBS: rtmp://10.8.0.250:1935/live
echo.
pause

