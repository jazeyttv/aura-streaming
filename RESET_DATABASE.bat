@echo off
echo.
echo ==========================================
echo   RESET DATABASE - Clear All Users
echo ==========================================
echo.
echo This will CLEAR ALL USERS from your database!
echo.
echo WARNING: This cannot be undone!
echo.
pause

echo.
echo Checking database type...
echo.

REM Check if MongoDB is running
mongo --eval "db.version()" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo MongoDB detected!
    echo.
    echo Clearing MongoDB database...
    mongo kicky --eval "db.dropDatabase()"
    echo.
    echo MongoDB database cleared!
) else (
    echo Using in-memory storage.
    echo Simply restart the server to clear all users.
)

echo.
echo ==========================================
echo   Database Reset Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Start your server: START_ALL.bat
echo 2. Login as admin:
echo    - Go to: http://localhost:3000/admin-login
echo    - Username: Jazey
echo    - Password: 1919
echo.
pause

