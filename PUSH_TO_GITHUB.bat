@echo off
echo ========================================
echo   PUSH AURA TO GITHUB
echo   Deployment Preparation
echo ========================================
echo.

echo [Step 1/4] Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please download Git from: https://git-scm.com/download/win
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

echo [Step 3/4] Adding files to Git...
git add .
echo ✅ Files added!
echo.

echo [Step 4/4] Creating commit...
git commit -m "Deploy AURA streaming platform"
echo ✅ Commit created!
echo.

echo ========================================
echo   READY TO PUSH TO GITHUB!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: aura-streaming
echo 3. Make it PUBLIC
echo 4. Click "Create repository"
echo.
echo 5. Then run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/aura-streaming.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR_USERNAME with your GitHub username!
echo.
echo ========================================
pause

