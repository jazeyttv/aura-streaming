@echo off
title Get Your Render Stream Key
color 0E

echo ==========================================
echo   GET YOUR RENDER STREAM KEY
echo ==========================================
echo.
echo Your RTMP server is connected to RENDER backend.
echo You MUST use your RENDER stream key, not local!
echo.
echo ==========================================
echo   STEP 1: Go to Render Dashboard
echo ==========================================
echo.
echo Open: https://aura-streaming-1.onrender.com/dashboard
echo.
echo ==========================================
echo   STEP 2: Login
echo ==========================================
echo.
echo Login with your Render account
echo (If you don't have one, sign up first!)
echo.
echo ==========================================
echo   STEP 3: Copy Stream Key
echo ==========================================
echo.
echo Look for "Stream Key" on the dashboard
echo Click the EYE icon to reveal it
echo Click COPY button
echo.
echo ==========================================
echo   STEP 4: Use in OBS
echo ==========================================
echo.
echo Server: rtmp://localhost:1935/live
echo Stream Key: [PASTE KEY FROM RENDER DASHBOARD]
echo.
echo ==========================================
echo   WHY THIS IS NEEDED
echo ==========================================
echo.
echo Your RTMP server validates keys against Render database
echo Local stream keys don't exist in Render database
echo You must use the key from Render dashboard
echo.
echo ==========================================
echo.
pause

