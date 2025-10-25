# 🚀 How to Restart AURA Servers

## Current Configuration
✅ **Network Access Mode** (10.8.0.250)
- Works on all devices on your local network
- No port forwarding needed
- Your phone can access via: http://10.8.0.250:3000

---

## Step 1: Close All Running Servers
1. Close all PowerShell/terminal windows
2. Make sure nothing is running on ports 3000, 5000, 8888, or 1935

---

## Step 2: Start the Servers

### Option A: Start Everything at Once (Recommended)
1. Double-click `START_ALL.bat` (starts frontend + backend)
2. Double-click `START_RTMP.bat` (starts media server)
3. Wait 30 seconds for everything to load

### Option B: Start Individually
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd client
npm start

# Terminal 3 - Media Server
cd server
npm run media-server
```

---

## Step 3: Access AURA

### From Your Computer:
- Frontend: http://localhost:3000
- Admin Login: Username: `Jazey`, Password: `1919`

### From Your Phone (Same Network):
- Frontend: http://10.8.0.250:3000
- Admin Login: Username: `Jazey`, Password: `1919`

### From Public Internet (requires port forwarding):
- Run `SETUP_PUBLIC_ACCESS.bat` first
- Frontend: http://72.23.212.188:3000
- You must forward ports: 3000, 5000, 8888, 1935 in your router

---

## Fixes Applied ✨

### 1. ✅ Partner Button Fixed
- Partner button now shows for ALL users in admin panel
- Admins can toggle partner status for any user
- Partner badge shows in chat and profile

### 2. ✅ Stream Page Redesigned (Kick Style)
- Added left sidebar with "Following" section
- Video player centered
- Chat on the right
- Proper layout matching Kick.com

### 3. ✅ Network Configuration Fixed
- Frontend now connects to `10.8.0.250:5000`
- Backend configured for network access
- CORS allows all devices on network

---

## Troubleshooting

### "Connection Refused" Errors
- **Solution**: Make sure you restarted ALL servers after running `SETUP_NETWORK_ACCESS.bat`
- The old processes might still be using the old configuration

### Phone Can't Access
- **Check**: Are you on the same WiFi network as your computer?
- **Try**: http://10.8.0.250:3000 (not localhost)
- **Firewall**: Make sure Windows Firewall allows Node.js

### Stream Not Showing
- **OBS Settings**:
  - Server: `rtmp://localhost:1935/live` (or use `10.8.0.250`)
  - Stream Key: Copy from Dashboard
- **Check**: Media server is running (`START_RTMP.bat`)

### Partner Button Not Working
- **Check**: Are you logged in as admin (Jazey)?
- **Refresh**: After toggling partner, refresh the page
- **Database**: Partner status is saved in MongoDB

---

## Quick Configuration Switcher

### Switch to Local Network (10.8.0.250)
```bash
.\SETUP_NETWORK_ACCESS.bat
```

### Switch to Public Internet (72.23.212.188)
```bash
.\SETUP_PUBLIC_ACCESS.bat
```

### Switch to Localhost Only
```bash
.\SWITCH_TO_LOCALHOST.bat
```

After switching, **always restart all servers**!

---

## Current Status

✅ Admin login works (Jazey / 1919)  
✅ Streaming works with OBS  
✅ Chat works with badges  
✅ Follow system works  
✅ Partner system works  
✅ Profile settings work  
✅ Stream cleanup on restart  
✅ Neon futuristic theme  
✅ Kick-style layout  
✅ Network access configured  

🔄 **Next**: Restart servers and test on phone!

