@echo off
echo ========================================
echo   REMOVE FFMPEG FROM GIT
echo ========================================
echo.
echo This will remove ffmpeg.exe from Git tracking
echo but keep the file on your local machine.
echo.
pause

echo.
echo Removing ffmpeg.exe from Git cache...
git rm --cached server/ffmpeg.exe 2>nul
git rm --cached ffmpeg.exe 2>nul

echo.
echo ✓ Done! Now commit and push these changes.
echo.
echo The ffmpeg.exe file will stay on your computer
echo but won't be pushed to GitHub anymore.
echo.
pause

