@echo off
echo ========================================
echo  Switching to NETWORK Mode
echo ========================================
echo.
echo This will configure the app to work on:
echo   http://10.8.0.250:3000
echo.
pause

REM Update client .env
cd client
(
echo # API Configuration - Network mode
echo REACT_APP_API_URL=http://10.8.0.250:5000
echo REACT_APP_SOCKET_URL=http://10.8.0.250:5000
echo REACT_APP_MEDIA_URL=http://10.8.0.250:8888
) > .env
echo ✅ Client configured for network IP
cd ..

REM Update server config
cd server
powershell -Command "(gc config.env) -replace 'PUBLIC_IP=.*', 'PUBLIC_IP=10.8.0.250' | Out-File -encoding utf8 config.env"
echo ✅ Server configured for network IP
cd ..

echo.
echo ========================================
echo  Configuration Complete!
echo ========================================
echo.
echo Now restart your servers:
echo   1. Stop START_ALL.bat (Ctrl+C)
echo   2. Run START_ALL.bat
echo   3. Run START_RTMP.bat
echo.
echo Access your site at: http://10.8.0.250:3000
echo.
pause

