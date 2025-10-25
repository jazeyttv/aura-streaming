@echo off
echo ========================================
echo   DEPLOY AURA - CUSTOM FOR JAZEYTTV
echo   GitHub Deployment Script
echo ========================================
echo.

echo [Step 1/4] Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Download Git from: https://git-scm.com/download/win
    echo Install it, then run this script again.
    echo.
    pause
    exit /b 1
)
echo ✅ Git is installed!
echo.

echo [Step 2/4] Initializing Git repository...
if not exist ".git" (
    git init
    echo ✅ Git initialized!
) else (
    echo ℹ️  Git already initialized
)
echo.

echo [Step 3/4] Adding all files...
git add .
echo ✅ Files added!
echo.

echo [Step 4/4] Creating commit...
git commit -m "Deploy AURA streaming platform"
if %errorlevel% neq 0 (
    echo ℹ️  No changes to commit or already committed
) else (
    echo ✅ Commit created!
)
echo.

echo ========================================
echo   READY TO PUSH TO GITHUB!
echo ========================================
echo.
echo Your GitHub username: jazeyttv
echo.
echo Next steps:
echo.
echo 1. Go to GitHub and create a new repo:
echo    https://github.com/new
echo.
echo 2. Repository name: aura-streaming
echo 3. Make it PUBLIC
echo 4. Click "Create repository"
echo.
echo 5. Then run these commands:
echo.
echo ========================================

echo git remote add origin https://github.com/jazeyttv/aura-streaming.git
echo git branch -M main
echo git push -u origin main

echo ========================================
echo.
echo Copy and paste those commands above ^
echo Or press any key to auto-execute them...
echo.
pause

echo.
echo ========================================
echo   PUSHING TO GITHUB...
echo ========================================
echo.

git remote add origin https://github.com/jazeyttv/aura-streaming.git 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  Remote already exists, updating...
    git remote set-url origin https://github.com/jazeyttv/aura-streaming.git
)

git branch -M main
echo ✅ Branch set to main

echo.
echo Pushing to GitHub...
echo (You may be asked to login to GitHub)
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   🎉 SUCCESS! CODE IS ON GITHUB!
    echo ========================================
    echo.
    echo Your repo: https://github.com/jazeyttv/aura-streaming
    echo.
    echo Next: Follow DEPLOYMENT_CHECKLIST.md
    echo to deploy to Render.com and get your free domain!
    echo.
) else (
    echo.
    echo ========================================
    echo   ⚠️  PUSH FAILED
    echo ========================================
    echo.
    echo Make sure you:
    echo 1. Created the repo on GitHub first
    echo 2. Named it: aura-streaming
    echo 3. Made it PUBLIC
    echo.
    echo Then run this script again!
    echo.
)

echo ========================================
pause

