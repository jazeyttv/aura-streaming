@echo off
echo.
echo ==========================================
echo   FFmpeg Quick Download Helper
echo ==========================================
echo.
echo This will help you download FFmpeg
echo.
echo Option 1: Quick Copy Method (Easiest!)
echo ----------------------------------------
echo 1. Download from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
echo 2. Extract the ZIP file
echo 3. Find ffmpeg.exe in the bin folder
echo 4. Copy it to this folder: %~dp0server\
echo.
echo Option 2: GitHub Build (Recommended)
echo ----------------------------------------
echo 1. Download from: https://github.com/BtbN/FFmpeg-Builds/releases
echo 2. Get: ffmpeg-master-latest-win64-gpl.zip
echo 3. Extract and copy ffmpeg.exe to: %~dp0server\
echo.
echo ==========================================
echo.
echo Opening download page in browser...
echo.
timeout /t 3 /nobreak >nul

start https://github.com/BtbN/FFmpeg-Builds/releases

echo.
echo After downloading:
echo 1. Extract the zip file
echo 2. Find ffmpeg.exe in bin folder
echo 3. Copy it to: %~dp0server\
echo 4. Run START_RTMP.bat again
echo.
echo Current directory: %~dp0
echo Copy ffmpeg.exe to: %~dp0server\ffmpeg.exe
echo.
pause

