@echo off
title AURA RTMP Server (Render Backend)
color 0A

echo ==========================================
echo   Starting RTMP Media Server
echo   Connected to Render Backend
echo ==========================================
echo.

REM Check if FFmpeg is available
where ffmpeg >nul 2>&1
if %errorlevel% equ 0 (
    echo Checking if FFmpeg is available...
    echo FFmpeg found in PATH!
) else (
    echo FFmpeg not found in PATH, using local version...
)

echo.
echo Starting RTMP server...
echo Server will run on port 1935 (RTMP) and 8888 (HLS)
echo.
echo Backend: https://aura-streaming.onrender.com
echo.
echo Use in OBS:
echo   Server: rtmp://72.23.212.188:1935/live
echo   Stream Key: (from your dashboard on Render site)
echo.
echo Keep this window open while streaming!
echo Press Ctrl+C to stop
echo.
echo ==========================================
echo.

REM Set environment variable for Render backend
set API_SERVER=https://aura-streaming.onrender.com

REM Change to server directory with full path
cd /d "%~dp0server"

node media-server.js

pause

