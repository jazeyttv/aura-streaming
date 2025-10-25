@echo off
echo.
echo ==========================================
echo   Starting RTMP Media Server
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo ERROR: server folder not found!
    echo Make sure you run this from the Kicky root folder.
    echo.
    pause
    exit /b 1
)

cd server

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing server dependencies...
    call npm install
    echo.
)

echo Checking if FFmpeg is available...
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "ffmpeg.exe" (
        echo FFmpeg found in server folder!
    ) else (
        echo.
        echo WARNING: FFmpeg not found!
        echo RTMP server will work but video transcoding may fail.
        echo.
        echo Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
        echo Extract it and copy ffmpeg.exe to the server folder.
        echo.
        echo Press any key to continue anyway...
        pause
    )
) else (
    echo FFmpeg found in PATH!
)

echo.
echo Starting RTMP server...
echo Server will run on port 1935 (RTMP) and 8000 (HLS)
echo.
echo Use in OBS:
echo   Server: rtmp://localhost:1935/live
echo   Stream Key: (from your dashboard)
echo.
echo Keep this window open while streaming!
echo Press Ctrl+C to stop
echo.
echo ==========================================
echo.

node media-server.js

echo.
echo ==========================================
echo RTMP Server Stopped
echo ==========================================
echo.
pause
