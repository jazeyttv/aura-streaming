# 🎬 Install FFmpeg for RTMP Streaming

## ⚡ Quick Install (5 Minutes)

### Method 1: Quick Download (Easiest!)

1. **Download FFmpeg:**
   - Go to: https://github.com/BtbN/FFmpeg-Builds/releases
   - Download: `ffmpeg-master-latest-win64-gpl.zip`
   - Or direct link: https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip

2. **Extract the ZIP file**
   - Right-click → Extract All
   - Extract to: `C:\ffmpeg`

3. **Copy ffmpeg.exe to your server folder**
   - Open: `C:\ffmpeg\bin\`
   - Copy `ffmpeg.exe`
   - Paste into: `C:\Users\wydze\Desktop\Kicky\server\`

4. **Done!** Restart RTMP server.

---

### Method 2: Add to PATH (Better for long-term)

1. **Download and extract** (same as above)
   - Extract to: `C:\ffmpeg`

2. **Add to Windows PATH:**
   - Press `Windows + X`
   - Click "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\ffmpeg\bin`
   - Click "OK" on all windows

3. **Restart PowerShell** (close and reopen)

4. **Test it:**
   ```powershell
   ffmpeg -version
   ```
   Should show FFmpeg version info!

---

### Method 3: Chocolatey (For Advanced Users)

```powershell
# Run PowerShell as Administrator
choco install ffmpeg

# Test
ffmpeg -version
```

---

## 🎯 Quick Copy Method (Recommended!)

**Just download and copy to server folder:**

1. Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

2. Extract the zip file

3. Find `ffmpeg.exe` inside `bin` folder

4. Copy it to: `C:\Users\wydze\Desktop\Kicky\server\`

5. Restart RTMP server with `START_RTMP.bat`

**Done!** No PATH needed.

---

## ✅ Verify Installation

### If you copied to server folder:
```powershell
cd C:\Users\wydze\Desktop\Kicky\server
.\ffmpeg.exe -version
```

### If you added to PATH:
```powershell
ffmpeg -version
```

Should show:
```
ffmpeg version N-xxxxx-gxxxxxx
...
```

---

## 🚀 After Installing FFmpeg

1. **Restart RTMP server:**
   ```powershell
   START_RTMP.bat
   ```

2. **You should see:**
   ```
   ✅ FFmpeg found!
   🎥 RTMP MEDIA SERVER - LIVE
   ```

3. **Connect OBS:**
   - Server: `rtmp://localhost:1935/live`
   - Stream Key: (from dashboard)
   - Click "Start Streaming"

4. **Stream works!** Video will be transcoded properly.

---

## 🎥 What FFmpeg Does

- **Transcodes video** - Converts OBS stream to HLS format
- **Creates segments** - Makes video chunks for smooth playback
- **Multiple qualities** - Can create different resolutions
- **Browser playback** - Converts to format browsers can play

---

## ⚠️ Can I Stream Without FFmpeg?

**Short answer: Yes, but limited.**

Without FFmpeg:
- ✅ OBS can connect
- ✅ RTMP server accepts stream
- ❌ Browser can't play video (no HLS)
- ❌ Only direct RTMP viewers (VLC) can watch

**So you need FFmpeg for browser viewing!**

---

## 🔧 Troubleshooting

### "FFmpeg not found" after installing

**Solutions:**
1. Restart all terminals
2. Make sure ffmpeg.exe is in server folder
3. Check PATH was added correctly
4. Try: `where ffmpeg` to see if Windows finds it

### FFmpeg installed but still error

**Try:**
```powershell
# Stop RTMP server
# Start it again
START_RTMP.bat
```

### Can't download from GitHub

**Alternative download sites:**
- https://www.gyan.dev/ffmpeg/builds/
- https://ffmpeg.org/download.html (official)

---

## 📦 What to Download

**Recommended build:**
- **Name:** ffmpeg-master-latest-win64-gpl.zip
- **Size:** ~100 MB
- **Contains:** ffmpeg.exe, ffprobe.exe, ffplay.exe

**You only need:** `ffmpeg.exe`

---

## 🎯 Complete Setup After FFmpeg

1. ✅ FFmpeg installed
2. ✅ RTMP server started (`START_RTMP.bat`)
3. ✅ Main app running (`START_ALL.bat`)
4. ✅ OBS configured with stream key
5. ✅ Click "Start Streaming" in OBS
6. ✅ Check website - stream appears!
7. ✅ Video plays in browser!

---

## 💡 Pro Tip

**Keep it simple:**
Just copy `ffmpeg.exe` to the `server` folder. No PATH needed, and it works immediately!

**Location:** `C:\Users\wydze\Desktop\Kicky\server\ffmpeg.exe`

---

## 📝 Quick Checklist

- [ ] Downloaded FFmpeg
- [ ] Extracted zip file
- [ ] Copied ffmpeg.exe to server folder
- [ ] Restarted RTMP server
- [ ] No more warning!
- [ ] OBS connects successfully
- [ ] Stream appears on website
- [ ] Video plays in browser

---

**Download link for lazy copy-paste:** 
https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip

**Copy to:**
`C:\Users\wydze\Desktop\Kicky\server\ffmpeg.exe`

**Restart:**
`START_RTMP.bat`

**Done!** 🎉

