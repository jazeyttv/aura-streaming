@echo off
echo ========================================
echo  Cleaning Up Old Streams
echo ========================================
echo.
echo This will mark all streams as ended in the database.
echo.
pause

cd server
node -e "const mongoose = require('mongoose'); const Stream = require('./models/Stream'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kicky').then(async () => { const result = await Stream.updateMany({ isLive: true }, { isLive: false, endedAt: new Date() }); console.log('Updated', result.modifiedCount, 'streams'); process.exit(0); }).catch(err => { console.error('Error:', err); process.exit(1); });"

echo.
echo ✅ Cleanup complete!
echo.
pause

