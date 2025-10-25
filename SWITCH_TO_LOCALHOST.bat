@echo off
echo ========================================
echo  Switching to LOCALHOST Mode
echo ========================================
echo.
echo This will configure the app to work on:
echo   http://localhost:3000
echo.
pause

REM Update client .env
cd client
(
echo # API Configuration - Localhost mode
echo REACT_APP_API_URL=http://localhost:5000
echo REACT_APP_SOCKET_URL=http://localhost:5000
echo REACT_APP_MEDIA_URL=http://localhost:8888
) > .env
echo ✅ Client configured for localhost
cd ..

REM Update server config
cd server
powershell -Command "(gc config.env) -replace 'PUBLIC_IP=.*', 'PUBLIC_IP=localhost' | Out-File -encoding utf8 config.env"
echo ✅ Server configured for localhost
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
echo Access your site at: http://localhost:3000
echo.
pause

