@echo off
title AURA - Clear All Streams & Keys
color 0C

echo ==========================================
echo   AURA STREAM CLEANUP UTILITY
echo ==========================================
echo.
echo This will:
echo  - End all active streams
echo  - Clear all stream data
echo  - Force users to get new keys
echo.
echo WARNING: This will kick all streamers offline!
echo.
pause

echo.
echo Stopping RTMP server if running...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq AURA RTMP*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Clearing media files...
if exist "server\media\live" (
    rmdir /S /Q "server\media\live"
    echo ✅ Media files cleared
) else (
    echo ℹ️ No media files to clear
)

echo.
echo Creating cleanup script...
(
echo const mongoose = require('mongoose'^);
echo const Stream = require('./models/Stream'^);
echo require('dotenv'^).config({ path: './config.env' }^);
echo.
echo async function clearStreams(^) {
echo   try {
echo     const MONGODB_URI = process.env.MONGODB_URI ^|^| 'mongodb://localhost:27017/aura';
echo     console.log('🔌 Connecting to MongoDB...'^);
echo     await mongoose.connect(MONGODB_URI^);
echo     console.log('✅ Connected!'^);
echo.
echo     console.log('🧹 Clearing all active streams...'^);
echo     const result = await Stream.updateMany(
echo       { isLive: true },
echo       { $set: { isLive: false, endedAt: new Date(^) } }
echo     ^);
echo     console.log(`✅ Cleared ${result.modifiedCount} active streams`^);
echo.
echo     console.log('🗑️ Deleting all stream documents...'^);
echo     const deleteResult = await Stream.deleteMany({});
echo     console.log(`✅ Deleted ${deleteResult.deletedCount} stream records`^);
echo.
echo     console.log('✨ All streams cleared! Users must create new keys.'^);
echo     process.exit(0^);
echo   } catch (error^) {
echo     console.error('❌ Error:', error.message^);
echo     process.exit(1^);
echo   }
echo }
echo.
echo clearStreams(^);
) > server\clear-streams.js

echo.
echo Running cleanup on LOCAL database...
cd server
node clear-streams.js
cd ..

echo.
echo ==========================================
echo   Cleanup Complete!
echo ==========================================
echo.
echo ✅ All streams cleared
echo ✅ All media files deleted
echo.
echo Next steps:
echo  1. Users must go to Dashboard
echo  2. Their stream key will auto-regenerate
echo  3. Copy new key to OBS
echo  4. Start streaming
echo.
echo To clear RENDER database too:
echo  - Login to Render backend logs
echo  - Run this script via shell
echo.
pause
del server\clear-streams.js

