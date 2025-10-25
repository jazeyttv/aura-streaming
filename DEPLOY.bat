@echo off
echo ========================================
echo   AURA STREAMING - DEPLOYMENT SCRIPT
echo ========================================
echo.

echo [1/4] Adding all changes to git...
git add -A
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo ✓ Changes staged

echo.
echo [2/4] Committing changes...
git commit -m "Add image upload system, custom badge display in chat, and banner fixes"
if %errorlevel% neq 0 (
    echo ERROR: Git commit failed!
    echo Note: If no changes to commit, this is normal.
)
echo ✓ Changes committed

echo.
echo [3/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Git push failed!
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub

echo.
echo [4/4] Deployment complete!
echo ========================================
echo.
echo ✅ Your code is now on GitHub
echo ⏳ Render will automatically deploy in 1-2 minutes
echo 🌐 Check your Render dashboard for deployment status
echo.
echo Features deployed:
echo   • Image upload system for avatars/banners
echo   • Custom badge display in stream chat
echo   • Banner display fixes
echo   • User badge selection UI
echo.
echo ========================================
pause

