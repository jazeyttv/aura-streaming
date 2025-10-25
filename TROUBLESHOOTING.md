# Troubleshooting Guide

## Common Errors and Fixes

### ❌ Error: "Module not found: Error: Can't resolve 'hls.js'"

**Problem:** Missing dependencies after updating files.

**Solution:**
```powershell
cd client
npm install
```

Then restart the application.

---

### ❌ Error: "Port 3000 is already in use"

**Problem:** Another application is using port 3000.

**Solution 1 - Kill the process:**
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution 2 - Change port:**
Edit `client/.env`:
```env
PORT=3001
```

---

### ❌ Error: "EADDRINUSE: address already in use :::5000"

**Problem:** Backend port 5000 is in use.

**Solution:**
```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change port in `server/.env`:
```env
PORT=5001
```

---

### ❌ MongoDB Connection Failed

**Problem:** MongoDB not installed or not running.

**Solution:** The app works without MongoDB! It uses in-memory storage.

**To use MongoDB:**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
3. Restart your app

---

### ❌ npm install fails with permission errors

**Solution:**
```powershell
# Run PowerShell as Administrator
# Then run:
npm install
```

---

### ❌ OBS can't connect to RTMP

**Checklist:**
- [ ] RTMP server running? Run: `npm run media-server` in server folder
- [ ] Correct URL? Should be: `rtmp://localhost:1935/live`
- [ ] Correct stream key? Copy from dashboard
- [ ] Firewall blocking? Check Windows Firewall settings

**Test RTMP:**
```powershell
# Check if port 1935 is listening
netstat -ano | findstr :1935
```

---

### ❌ Video won't play in browser

**Solutions:**
1. Check browser console (F12) for errors
2. Try Chrome (best compatibility)
3. Check HLS server is running on port 8000
4. Verify stream URL in browser:
   - http://localhost:8000/live/{STREAM_KEY}/index.m3u8

---

### ❌ Chat messages not appearing

**Checklist:**
- [ ] Backend running on port 5000?
- [ ] Check browser console for Socket.IO errors
- [ ] Try refreshing the page
- [ ] Check if you're logged in

**Test Socket.IO:**
Open browser console and check for:
```
WebSocket connection to 'ws://localhost:5000/socket.io/'
```

---

### ❌ Can't access from other devices

**For Local Network:**
1. Get your IP: `ipconfig`
2. Update `client/.env`:
   ```env
   REACT_APP_API_URL=http://YOUR_IP:5000
   ```
3. Add firewall rule:
   ```powershell
   netsh advfirewall firewall add rule name="Kicky" dir=in action=allow protocol=TCP localport=3000,5000,8000,1935
   ```

---

### ❌ Stream appears but shows loading forever

**Problem:** FFmpeg not found or video transcoding failed.

**Solutions:**
1. Install FFmpeg:
   - Download from: https://ffmpeg.org/download.html
   - Add to PATH

2. Or use direct RTMP (no transcoding):
   - Viewers need VLC or RTMP player

---

### ❌ High CPU usage

**Problem:** Video transcoding is CPU intensive.

**Solutions:**
1. Lower OBS bitrate (Settings → Output → Bitrate: 2500)
2. Reduce resolution (Settings → Video → 1280x720)
3. Use hardware encoding in OBS (NVENC, QuickSync, etc.)

---

### ❌ Dependencies not installing

**Full clean install:**
```powershell
# Remove all node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force client\node_modules
Remove-Item -Recurse -Force server\node_modules

# Remove package locks
Remove-Item package-lock.json
Remove-Item client\package-lock.json
Remove-Item server\package-lock.json

# Fresh install
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

### ❌ Application won't start after reboot

**Problem:** Environment variables or paths changed.

**Solution:**
1. Make sure you're in the Kicky directory
2. Run `START_ALL.bat` again
3. Check all .env files exist

---

## Quick Restart Guide

**Complete restart:**
1. Stop all servers (Ctrl+C in all terminals)
2. Close all PowerShell windows
3. Run `START_ALL.bat` again

**Individual restarts:**

**Backend only:**
```powershell
cd server
node server.js
```

**Frontend only:**
```powershell
cd client
npm start
```

**RTMP server only:**
```powershell
cd server
npm run media-server
```

---

## Verification Commands

**Check if everything is running:**
```powershell
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# HLS
curl http://localhost:8000
```

**Check ports:**
```powershell
netstat -ano | findstr "3000 5000 8000 1935"
```

---

## Getting Help

**Before asking for help, provide:**
1. Error message (full text)
2. Console/terminal output
3. Browser console errors (F12)
4. Steps to reproduce
5. What you've tried

**Logs to check:**
- Terminal running backend
- Terminal running frontend
- Terminal running RTMP server
- Browser console (F12 → Console tab)

---

## Performance Tips

**For better streaming:**
1. Close unnecessary applications
2. Use wired internet (not WiFi)
3. Upload speed: 5+ Mbps for 720p, 10+ for 1080p
4. Lower OBS bitrate if stream is choppy

**For better viewing:**
1. Use Chrome browser (best HLS support)
2. Close other tabs
3. Good internet connection
4. Disable browser extensions if problems

---

## Reset Everything

**Nuclear option - start fresh:**
```powershell
# Delete everything
Remove-Item -Recurse -Force node_modules, client\node_modules, server\node_modules
Remove-Item package-lock.json, client\package-lock.json, server\package-lock.json

# Reinstall
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Restart
START_ALL.bat
```

---

## Still Having Issues?

1. Check all documentation files
2. Verify Node.js version: `node --version` (should be 16+)
3. Make sure you're in the correct directory
4. Try on a fresh restart
5. Check Windows Firewall isn't blocking

**Common fixes that solve 90% of issues:**
- ✅ Restart everything
- ✅ Run `npm install` in all folders
- ✅ Check .env files exist
- ✅ Verify all ports are free
- ✅ Check firewall settings

