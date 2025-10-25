# 📱 Phone Streaming Guide

## 🎯 **Quick Start (3 Steps)**

### **Step 1: Get Your Stream Key**
1. On your phone browser, go to: `http://10.8.0.250:3000`
2. Login to your account
3. Tap your **profile icon** (top right)
4. Tap **"Creator Dashboard"**
5. You'll see your **Stream Key** - tap **Copy**

### **Step 2: Download Streaming App**
Download one of these apps:

**Best Options:**
- **Prism Live Studio** (iOS/Android) - Recommended!
- **Streamlabs Mobile** (iOS/Android)
- **Larix Broadcaster** (iOS/Android)

### **Step 3: Configure App**
1. Open the streaming app
2. Go to **Settings** → **Stream**
3. Select **"Custom RTMP"**
4. Enter these details:

```
Server URL: rtmp://10.8.0.250:1935/live
Stream Key: [paste your key from dashboard]
```

**That's it! Hit "Go Live" and you're streaming!** 🎉

---

## 📱 **Detailed: Prism Live Studio Setup**

### **1. Install App:**
- **iOS:** App Store → Search "Prism Live Studio"
- **Android:** Play Store → Search "Prism Live Studio"

### **2. First Launch:**
1. Open Prism
2. Skip any tutorials
3. Tap **⚙️ Settings** icon

### **3. Configure Streaming:**
1. Tap **"Streaming Platforms"**
2. Tap **"+ Add Platform"**
3. Select **"Custom RTMP"**
4. Enter:
   - **Name:** AURA
   - **Server URL:** `rtmp://10.8.0.250:1935/live`
   - **Stream Key:** Your key from dashboard
5. Tap **Save**

### **4. Test Stream:**
1. Go back to main screen
2. Tap **"Go Live"**
3. Wait 10-15 seconds
4. Open browser → `http://10.8.0.250:3000`
5. Your stream should appear!

---

## 📱 **Detailed: Streamlabs Mobile Setup**

### **1. Install App:**
- App Store or Play Store → "Streamlabs"

### **2. Configure:**
1. Open Streamlabs
2. Tap **Settings** → **Stream**
3. Select **"Other / Custom"**
4. Enter:
   - **Server:** `rtmp://10.8.0.250:1935/live`
   - **Stream Key:** Your key
5. Save

### **3. Go Live:**
1. Tap **"Go Live"**
2. Choose camera (front/back)
3. Start streaming!

---

## 🎮 **Recommended Settings (Phone)**

### **For Best Quality:**
```
Resolution: 1280x720 (720p)
Bitrate: 2500-3500 kbps
Frame Rate: 30 FPS
Encoder: H.264
Audio Bitrate: 128 kbps
```

### **For Stable Connection:**
```
Resolution: 960x540 (qHD)
Bitrate: 1500-2500 kbps
Frame Rate: 30 FPS
```

### **For Weak WiFi/Mobile Data:**
```
Resolution: 640x360
Bitrate: 800-1500 kbps
Frame Rate: 30 FPS
```

---

## 📋 **Pre-Stream Checklist:**

- [ ] Phone is charging (streaming drains battery!)
- [ ] Good WiFi or strong mobile data (5+ Mbps upload)
- [ ] Stream key copied from dashboard
- [ ] RTMP settings configured in app
- [ ] "Do Not Disturb" mode ON (prevent notifications)
- [ ] Screen orientation locked (landscape/portrait)

---

## 🔧 **Your RTMP Settings:**

### **Local Network (Same WiFi):**
```
Server: rtmp://10.8.0.250:1935/live
Stream Key: [from your dashboard]
```

### **Public Internet (Anywhere):**
```
Server: rtmp://72.23.212.188:1935/live
Stream Key: [from your dashboard]
```

**Use local network when at home, public IP when away!**

---

## 🎯 **Step-by-Step: Getting Your Stream Key**

### **On Phone Browser:**
1. Open Safari/Chrome
2. Go to: `http://10.8.0.250:3000`
3. Tap **Login**
4. Enter username & password
5. Tap your **profile picture** (top right corner)
6. Tap **"Creator Dashboard"**
7. You'll see: **Stream Key: sk_abc123...**
8. Tap **"Copy"** button
9. Key is now in your clipboard!

### **Paste into Prism:**
1. Open Prism app
2. Settings → Streaming Platforms → Custom RTMP
3. Tap in **"Stream Key"** field
4. **Long press** → **Paste**
5. Done!

---

## ⚡ **Quick Troubleshooting:**

### **"Can't connect to server"**
✅ Make sure you're on the same WiFi as your computer  
✅ Check RTMP URL: `rtmp://10.8.0.250:1935/live`  
✅ Make sure RTMP server is running on computer  

### **"Invalid stream key"**
✅ Copy key again from dashboard (no spaces!)  
✅ Make sure you copied the FULL key  
✅ Try resetting your key in dashboard  

### **Stream is laggy/buffering**
✅ Lower bitrate to 1500-2000 kbps  
✅ Lower resolution to 720p or 540p  
✅ Use WiFi instead of mobile data  
✅ Move closer to WiFi router  

### **Stream not showing on website**
✅ Wait 15-20 seconds after starting  
✅ Refresh the homepage  
✅ Check if you're logged into dashboard  
✅ Make sure stream key is correct  

---

## 🌐 **Network Options:**

### **Option 1: Same WiFi (Local Network)**
- **Fastest and most stable**
- **Best for home use**
- Server: `rtmp://10.8.0.250:1935/live`
- Website: `http://10.8.0.250:3000`

### **Option 2: Public Internet**
- **Stream from anywhere**
- **Requires port forwarding**
- Server: `rtmp://72.23.212.188:1935/live`
- Website: `http://72.23.212.188:3000`

### **Option 3: Mobile Hotspot**
- **Stream on the go**
- **Uses mobile data (careful with caps!)**
- Server: `rtmp://72.23.212.188:1935/live`
- Check upload speed first (speedtest.net)

---

## 💡 **Pro Tips for Phone Streaming:**

### **Before Stream:**
1. **Charge your phone** - streaming kills battery in 1-2 hours
2. **Close background apps** - free up resources
3. **Test your upload speed** - need 5+ Mbps
4. **Lock screen orientation** - prevent rotation mid-stream
5. **Enable Do Not Disturb** - no notification popups

### **During Stream:**
1. **Keep phone plugged in** if possible
2. **Use headphones** for better audio
3. **Monitor chat** on browser (different device/tab)
4. **Stay near WiFi router** for stable connection
5. **Don't let phone overheat** - take breaks if hot

### **Best Practices:**
- Stream in **landscape mode** for wider view
- Use **good lighting** (face camera toward window/light)
- Test stream for 30 seconds before announcing
- Have a **backup plan** (computer streaming) if phone fails
- Keep stream key **secret** - never show on camera!

---

## 📊 **App Comparison:**

| App | Quality | Ease of Use | Features | Free? |
|-----|---------|-------------|----------|-------|
| **Prism** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Many | ✅ Yes |
| **Streamlabs** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Moderate | ✅ Yes |
| **Larix** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Advanced | ✅ Yes |

**We recommend Prism for beginners!**

---

## 🎉 **You're Ready!**

### **Quick Recap:**
1. Get stream key from dashboard
2. Download Prism (or similar app)
3. Enter RTMP: `rtmp://10.8.0.250:1935/live`
4. Paste your stream key
5. Hit "Go Live"!

### **Need Help?**
- Dashboard shows stream key: `/dashboard`
- Test at: `http://10.8.0.250:3000`
- Admin can reset your key if needed

**Happy streaming from your phone!** 📱🎥✨

