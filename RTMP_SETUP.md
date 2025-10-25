# 🎥 RTMP Streaming Setup Guide

## ❌ Problem: "Failed to connect to server" in OBS

This happens because the RTMP media server isn't running!

---

## ✅ Quick Fix

### Step 1: Start the RTMP Server

**Easy Way:**
Double-click: `START_RTMP.bat`

**Manual Way:**
```powershell
cd server
npm run media-server
```

### Step 2: Wait for confirmation
You should see:
```
🎥 RTMP MEDIA SERVER - LIVE
📡 RTMP Server: rtmp://localhost:1935/live
```

### Step 3: Now connect OBS
Your RTMP server is ready!

---

## 📺 Complete OBS Setup

### 1. Get Your Stream Key
1. Go to http://localhost:3000
2. Login
3. Go to Dashboard
4. Click the 👁️ icon next to "Stream Key"
5. Click 📋 to copy your key

### 2. Configure OBS
1. Open OBS Studio
2. Go to: **File → Settings → Stream**
3. Set these values:
   - **Service:** Custom
   - **Server:** `rtmp://localhost:1935/live`
   - **Stream Key:** (paste your key)
4. Click **Apply** then **OK**

### 3. Test Connection
1. In OBS, click **Start Streaming**
2. If it connects, you're good!
3. Check your website - stream should appear automatically

---

## 🔧 Troubleshooting

### Issue 1: "Failed to connect to server"

**Solution:** RTMP server isn't running!
```powershell
# Open a new terminal
cd server
npm run media-server

# Keep this terminal open while streaming!
```

### Issue 2: OBS connects but stream doesn't appear on website

**Check:**
1. Backend server running? (port 5000)
2. Frontend running? (port 3000)
3. Check backend terminal for "Stream key validated" message
4. Refresh your website

### Issue 3: "Invalid stream key"

**Solutions:**
1. Copy key again from dashboard
2. Make sure you're logged in
3. Try regenerating your stream key
4. Check for extra spaces when pasting

### Issue 4: Stream appears but video is black/frozen

**Check:**
1. OBS sources added? (Display Capture, Game Capture, etc.)
2. OBS preview shows video?
3. Click "Start Streaming" in OBS (not just open it)

### Issue 5: Port 1935 already in use

**Check what's using it:**
```powershell
netstat -ano | findstr :1935
```

**Kill the process:**
```powershell
taskkill /PID <PID> /F
```

### Issue 6: FFmpeg not found

**Symptoms:**
- RTMP connects but video doesn't transcode
- HLS stream doesn't work

**Solution:**
1. Download FFmpeg: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   ```powershell
   # Run as Administrator
   setx /M PATH "%PATH%;C:\ffmpeg\bin"
   ```
4. Restart terminals
5. Test: `ffmpeg -version`

**Quick Alternative:**
- Download: https://github.com/BtbN/FFmpeg-Builds/releases
- Get: `ffmpeg-master-latest-win64-gpl.zip`
- Extract `ffmpeg.exe` to your `server` folder

---

## 🎮 Complete Streaming Workflow

### 1. Start Everything

**Terminal 1: Main App**
```powershell
START_ALL.bat
```
Or:
```powershell
npm run dev
```

**Terminal 2: RTMP Server**
```powershell
START_RTMP.bat
```
Or:
```powershell
cd server
npm run media-server
```

### 2. Get Stream Key
- Login → Dashboard → Copy stream key

### 3. Configure OBS
- Settings → Stream
- Server: `rtmp://localhost:1935/live`
- Key: (your key)

### 4. Add Sources
- Click + in Sources
- Add Display Capture or Game Capture

### 5. Start Streaming!
- Click "Start Streaming" in OBS
- Check website - you're live!

---

## 🌐 Network Streaming

### Local Network (WiFi)
**RTMP URL:** `rtmp://YOUR_LOCAL_IP:1935/live`

Example: `rtmp://192.168.1.100:1935/live`

### Public Internet
**RTMP URL:** `rtmp://YOUR_PUBLIC_IP:1935/live`

Example: `rtmp://123.456.789.123:1935/live`

**Don't forget:**
- Forward port 1935 in router
- Add firewall rule for port 1935

---

## 📋 Port Checklist

Make sure these are running:

| Port | Service | Check |
|------|---------|-------|
| 3000 | Frontend | http://localhost:3000 |
| 5000 | Backend | http://localhost:5000/api/health |
| 8000 | HLS Media | http://localhost:8000 |
| 1935 | RTMP | Start with START_RTMP.bat |

---

## 🔍 Verify Everything Works

### Test 1: Check if RTMP is listening
```powershell
netstat -ano | findstr :1935
```
Should show: `TCP  0.0.0.0:1935`

### Test 2: Check backend
```powershell
curl http://localhost:5000/api/health
```
Should return: `{"status":"OK"}`

### Test 3: Check if stream key is valid
1. Copy your stream key
2. Check backend logs when you start streaming
3. Should see: "Stream key validated for: YOUR_USERNAME"

### Test 4: Check HLS
When streaming, visit:
```
http://localhost:8000/live/YOUR_STREAM_KEY/index.m3u8
```
Should download a playlist file.

---

## 🎥 OBS Settings Recommendations

### Output Settings
- **Output Mode:** Simple
- **Video Bitrate:** 2500 Kbps (720p) or 4500 Kbps (1080p)
- **Encoder:** x264 (or use NVENC if you have Nvidia GPU)
- **Audio Bitrate:** 160

### Video Settings
- **Base Resolution:** 1920x1080
- **Output Resolution:** 1280x720 (for most users)
- **FPS:** 30 (or 60 if you have good upload speed)

### Advanced Settings
- **Keyframe Interval:** 2 seconds
- **CPU Usage Preset:** veryfast (or faster if CPU is weak)

---

## 🚀 Advanced: Multiple Qualities

Want to stream in multiple qualities? Edit `server/media-server.js`:

```javascript
trans: {
  ffmpeg: 'ffmpeg',
  tasks: [
    {
      app: 'live',
      hls: true,
      hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      // Add multiple quality options
      mp4: true,
      mp4Flags: '[movflags=faststart]'
    }
  ]
}
```

---

## 📝 Common OBS Errors

### "Failed to connect to server"
- RTMP server not running → Run START_RTMP.bat

### "Invalid stream key"
- Wrong key → Copy again from dashboard

### "Connection timed out"
- Firewall blocking → Add rule for port 1935

### "Server returned error"
- Backend not running → Start with START_ALL.bat
- Stream key doesn't exist → Check you're logged in

### "Encoding overloaded"
- Lower bitrate in OBS settings
- Lower resolution (720p instead of 1080p)
- Change CPU preset to "faster" or "veryfast"

---

## 🎯 Quick Checklist

Before streaming, verify:
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] RTMP server running (port 1935)
- [ ] Logged into website
- [ ] Stream key copied from dashboard
- [ ] OBS configured with correct server & key
- [ ] Sources added in OBS
- [ ] Preview shows video in OBS

Then click "Start Streaming" in OBS!

---

## 💡 Pro Tips

1. **Keep RTMP Terminal Open**
   - Don't close the RTMP server window while streaming
   - It needs to run continuously

2. **Test Locally First**
   - Use `rtmp://localhost:1935/live` first
   - Once working, try network/public IPs

3. **Monitor Backend Logs**
   - Watch for "Stream key validated" message
   - Shows when OBS successfully connects

4. **Check Stream on Website**
   - Open your homepage in browser
   - Your stream should appear automatically
   - Click it to test viewer experience

5. **Restart if Issues**
   - Stop OBS streaming
   - Restart RTMP server
   - Try connecting again

---

## 🆘 Still Not Working?

### Check All Services:
```powershell
# Check what's running
netstat -ano | findstr "3000 5000 8000 1935"

# Should see all 4 ports
```

### Check Firewall:
```powershell
# Add rule for RTMP
netsh advfirewall firewall add rule name="Kicky RTMP" dir=in action=allow protocol=TCP localport=1935
```

### Try Different Port:
Edit `server/.env`:
```env
RTMP_PORT=1936
```

Then use `rtmp://localhost:1936/live` in OBS.

---

## 📞 Need Help?

1. Check terminal outputs for error messages
2. Check OBS logs (Help → Log Files → Current Log)
3. Verify stream key is correct
4. Try with fresh OBS profile
5. Test with VLC: `rtmp://localhost:1935/live/YOUR_KEY`

---

**Remember: You need TWO terminals running!**
1. Main app (START_ALL.bat)
2. RTMP server (START_RTMP.bat)

**Both must stay open while streaming!** 🎥

