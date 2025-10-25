# 📱💻 How to Stream on AURA

## 🌍 **For EVERYONE to Stream (Worldwide Access)**

Anyone can stream to your platform from anywhere! Here's what they need:

---

## ✨ **Quick Setup (3 Steps)**

### **Step 1: Create Account & Get Stream Key**
1. Go to: `http://72.23.212.188:3000` (Your public site)
2. Click **"Register"** → Create account
3. Click **"Dashboard"** → Copy your **Stream Key**

### **Step 2: Choose Your Streaming App**
- **Computer:** OBS Studio (recommended)
- **Phone:** Prism Live Studio, Streamlabs Mobile
- **Other:** Any RTMP-compatible app

### **Step 3: Enter These Settings**
```
RTMP Server: rtmp://72.23.212.188:1935/live
Stream Key: [Your key from dashboard]
```

---

## 📱 **Phone Streaming (Prism Live Studio)**

### **Settings:**
1. Open **Prism Live Studio** app
2. Tap **Settings** ⚙️
3. Tap **"Custom RTMP"**
4. Enter:
   - **Server URL:** `rtmp://72.23.212.188:1935/live`
   - **Stream Key:** `sk_your_stream_key_here` (from dashboard)

### **Example:**
```
Server: rtmp://72.23.212.188:1935/live
Key: sk_abc123def456...
```

### **On VPN:**
✅ Works with VPN enabled  
✅ Works on mobile data  
✅ Works on WiFi  

---

## 💻 **Computer Streaming (OBS Studio)**

### **Settings:**
1. Open **OBS Studio**
2. Go to **Settings** → **Stream**
3. Set **Service:** `Custom`
4. Enter:
   - **Server:** `rtmp://72.23.212.188:1935/live`
   - **Stream Key:** Your key from dashboard

### **OBS Screenshot:**
```
┌─────────────────────────────────────┐
│ Service:    [Custom]                │
│ Server:     rtmp://72.23.212.188:   │
│             1935/live                │
│ Stream Key: sk_abc123...            │
│ ☑ Use Authentication: OFF           │
└─────────────────────────────────────┘
```

---

## 🎯 **Stream Key Examples**

Your stream key looks like this:
```
sk_77bcdc6460b645bda186f0aba486ea85
```

### **Where to Find It:**
1. Login to AURA
2. Click **"Dashboard"** (top right menu)
3. See **"Stream Key"** section
4. Click **"Copy"** button

### **Keep It Secret!** 🔒
- ⚠️ Never share your stream key
- ⚠️ Don't show it on stream
- ✅ Regenerate if exposed (dashboard has button)

---

## 🚀 **Recommended Settings**

### **For Mobile (Prism/Streamlabs):**
```
Resolution: 1280x720 (720p)
Bitrate: 2500-3500 kbps
FPS: 30
Encoder: H.264
```

### **For Computer (OBS):**
```
Output Mode: Simple
Video Bitrate: 3500-6000 kbps
Encoder: x264 (or NVENC if Nvidia GPU)
Audio Bitrate: 160 kbps
Resolution: 1920x1080 (1080p)
FPS: 30 or 60
```

---

## 🌐 **Network Requirements**

### **For Streamers:**
- **Upload Speed:** 5+ Mbps (test at speedtest.net)
- **Stable Connection:** WiFi or good mobile data
- **Ports:** No port forwarding needed (you did it!)

### **For Viewers:**
- **Download Speed:** 3+ Mbps
- **Any Browser:** Chrome, Firefox, Edge, Safari
- **Any Device:** Phone, tablet, computer

---

## 🔧 **Troubleshooting**

### **"Failed to connect to server"**
✅ Double-check RTMP URL: `rtmp://72.23.212.188:1935/live`  
✅ Make sure stream key is correct  
✅ Check your internet connection  

### **"Invalid stream key"**
✅ Copy key again from dashboard  
✅ Make sure there's no extra spaces  
✅ Regenerate key if needed  

### **Stream lags/buffers**
✅ Lower bitrate (2500 kbps)  
✅ Lower resolution (720p)  
✅ Lower FPS (30)  
✅ Check upload speed  

### **Not showing on website**
✅ Wait 10-15 seconds after starting stream  
✅ Refresh the homepage  
✅ Make sure you're logged into dashboard  

---

## 📊 **Going Live Checklist**

### **Before Streaming:**
- [ ] Account created
- [ ] Stream key copied
- [ ] RTMP settings entered in app
- [ ] Test your internet speed
- [ ] Set stream title in dashboard

### **During Stream:**
- [ ] Monitor chat (on website)
- [ ] Check viewer count
- [ ] Interact with audience
- [ ] Keep stream key hidden

### **After Stream:**
- [ ] Click "Stop Streaming" in app
- [ ] (Optional) Click "End Stream" in dashboard
- [ ] Check stream stats

---

## 🎮 **Popular Streaming Apps**

### **Mobile:**
| App | Platform | Rating |
|-----|----------|--------|
| **Prism Live Studio** | iOS/Android | ⭐⭐⭐⭐⭐ |
| **Streamlabs Mobile** | iOS/Android | ⭐⭐⭐⭐ |
| **Larix Broadcaster** | iOS/Android | ⭐⭐⭐⭐ |

### **Computer:**
| App | Platform | Rating |
|-----|----------|--------|
| **OBS Studio** | Win/Mac/Linux | ⭐⭐⭐⭐⭐ |
| **Streamlabs Desktop** | Win/Mac | ⭐⭐⭐⭐ |
| **XSplit** | Windows | ⭐⭐⭐⭐ |

---

## 💡 **Pro Tips**

### **For Best Quality:**
1. Use **WiFi** over mobile data (if possible)
2. Close other apps using internet
3. Stream during off-peak hours
4. Test stream before going live
5. Use good lighting and audio

### **For More Viewers:**
1. Set an interesting stream title
2. Stream regularly (same time/days)
3. Interact with chat
4. Use tags/categories (coming soon!)
5. Promote on social media

### **For Phone Streamers:**
1. Charge while streaming (battery drains fast)
2. Use headphones for better audio
3. Enable "Do Not Disturb" mode
4. Lock screen orientation
5. Close background apps

---

## 🎯 **Your Platform URLs**

### **Main Site:**
```
http://72.23.212.188:3000
```

### **RTMP Server:**
```
rtmp://72.23.212.188:1935/live
```

### **Media Server (HLS):**
```
http://72.23.212.188:8888
```

---

## 📧 **Need Help?**

### **Common Issues:**
- Stream won't start → Check stream key
- Can't login → Clear browser cache
- Follow not working → Log out and back in
- Video won't play → Refresh page

### **Admin:**
- Username: `Jazey`
- Can help with: Bans, badges, issues

---

## ✅ **Quick Test**

### **1. Test Your Setup:**
```bash
1. Enter RTMP settings
2. Start streaming
3. Wait 10 seconds
4. Check homepage for your stream
5. Click your stream to watch
```

### **2. Everything Working?**
✅ Stream appears on homepage  
✅ Video plays smoothly  
✅ Chat works  
✅ Viewer count updates  

**You're ready to go! 🎉**

---

## 🌟 **Example: Setting Up Prism (Step-by-Step)**

### **On Your Phone:**

1. **Download Prism Live Studio** from App Store/Play Store

2. **Open App** → Tap ⚙️ Settings

3. **Tap "Streaming Platforms"** → Select **"Custom RTMP"**

4. **Enter Details:**
   ```
   Name: AURA
   Server: rtmp://72.23.212.188:1935/live
   Stream Key: [paste from dashboard]
   ```

5. **Save** → Go back to main screen

6. **Tap "Go Live"** button

7. **Wait 10 seconds**

8. **Open browser** → Go to `http://72.23.212.188:3000`

9. **Your stream is LIVE!** 🎉

---

## 🎊 **You're All Set!**

**Share these settings with anyone who wants to stream on your platform!**

They just need:
- The RTMP URL: `rtmp://72.23.212.188:1935/live`
- Their own stream key (from their dashboard)
- Any streaming app

**That's it! No port forwarding needed on their end!** 🚀

