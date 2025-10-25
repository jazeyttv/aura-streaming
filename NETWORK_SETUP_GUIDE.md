# Network Setup Guide - Make Kicky Accessible Everywhere

## 🎯 Goal
Make your Kicky streaming platform accessible from:
1. ✅ Your computer (localhost)
2. ✅ Other devices on your WiFi (local network)
3. ✅ Anywhere on the internet (public access)

## 📋 Prerequisites

- Windows computer
- Internet connection
- Router with admin access
- Basic networking knowledge (we'll guide you!)

## 🚀 Quick Setup (3 Scenarios)

### Scenario 1: Just Me (Localhost Only)

**Use Case:** Testing on your own computer only

**Setup:** None needed! Just run:
```powershell
START_ALL.bat
```

**Access:** http://localhost:3000

---

### Scenario 2: Home Network (WiFi/LAN)

**Use Case:** Access from phones, tablets, other computers on same WiFi

**Setup Steps:**

1. **Find Your Local IP:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter
   Example: `192.168.1.100`

2. **Configure Server:**
   Edit `server/.env`:
   ```env
   PUBLIC_IP=192.168.1.100
   CORS_ORIGIN=http://192.168.1.100:3000
   ```

3. **Configure Client:**
   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://192.168.1.100:5000
   REACT_APP_SOCKET_URL=http://192.168.1.100:5000
   REACT_APP_MEDIA_URL=http://192.168.1.100:8000
   ```

4. **Allow Firewall (Run PowerShell as Admin):**
   ```powershell
   netsh advfirewall firewall add rule name="Kicky All" dir=in action=allow protocol=TCP localport=3000,5000,8000,1935
   ```

5. **Start Everything:**
   ```powershell
   START_ALL.bat
   ```

6. **Access from Other Devices:**
   - Open browser on phone/tablet (same WiFi)
   - Go to: `http://192.168.1.100:3000`

**OBS Streaming:**
- Server: `rtmp://192.168.1.100:1935/live`
- Stream Key: (from dashboard)

---

### Scenario 3: Public Internet (From Anywhere)

**Use Case:** Friends can access from anywhere, professional streaming platform

**Setup Steps:**

#### Part A: Find Your Public IP

1. Visit: https://whatismyipaddress.com/
2. Write down your public IP (e.g., `123.456.789.123`)

#### Part B: Port Forwarding

**Why?** Your router blocks incoming internet traffic by default. We need to open specific doors (ports).

**Step-by-Step Port Forwarding:**

1. **Access Your Router:**
   - Open browser: http://192.168.1.1 or http://192.168.0.1
   - Common router IPs:
     - Netgear: 192.168.1.1
     - Linksys: 192.168.1.1
     - TP-Link: 192.168.0.1
     - D-Link: 192.168.0.1
   - Login (common defaults):
     - Username: admin
     - Password: admin or password
     - (Check sticker on router!)

2. **Find Port Forwarding Menu:**
   - Different routers use different names:
     - "Port Forwarding"
     - "Virtual Server"
     - "NAT Forwarding"
     - "Applications & Gaming"
   - Usually under: Advanced → NAT or Security

3. **Add These 4 Rules:**

   **Rule 1: Frontend (React App)**
   ```
   Service Name: Kicky-Frontend
   External Port: 3000
   Internal Port: 3000
   Internal IP: 192.168.1.100 (your computer's local IP)
   Protocol: TCP
   ```

   **Rule 2: Backend (API Server)**
   ```
   Service Name: Kicky-Backend
   External Port: 5000
   Internal Port: 5000
   Internal IP: 192.168.1.100
   Protocol: TCP
   ```

   **Rule 3: Media Server (HLS)**
   ```
   Service Name: Kicky-Media
   External Port: 8000
   Internal Port: 8000
   Internal IP: 192.168.1.100
   Protocol: TCP
   ```

   **Rule 4: RTMP Streaming**
   ```
   Service Name: Kicky-RTMP
   External Port: 1935
   Internal Port: 1935
   Internal IP: 192.168.1.100
   Protocol: TCP
   ```

4. **Save & Apply Changes**
5. **Restart Router** (recommended)

#### Part C: Configure Application

1. **Edit `server/.env`:**
   ```env
   PUBLIC_IP=123.456.789.123
   CORS_ORIGIN=http://123.456.789.123:3000
   ```

2. **Edit `client/.env`:**
   ```env
   REACT_APP_API_URL=http://123.456.789.123:5000
   REACT_APP_SOCKET_URL=http://123.456.789.123:5000
   REACT_APP_MEDIA_URL=http://123.456.789.123:8000
   ```

3. **Windows Firewall:**
   ```powershell
   # Run as Administrator
   netsh advfirewall firewall add rule name="Kicky Public" dir=in action=allow protocol=TCP localport=3000,5000,8000,1935
   ```

#### Part D: Start & Test

1. **Start Platform:**
   ```powershell
   START_ALL.bat
   ```

2. **Test Locally First:**
   - Your Computer: http://localhost:3000 ✓

3. **Test Local Network:**
   - Phone (WiFi): http://192.168.1.100:3000 ✓

4. **Test Public Access:**
   - Phone (mobile data, WiFi OFF): http://123.456.789.123:3000 ✓
   - Friend's Computer: http://123.456.789.123:3000 ✓

5. **Test Port Forwarding:**
   - Visit: https://www.yougetsignal.com/tools/open-ports/
   - Enter your public IP and port 5000
   - Click "Check" - Should say "Open"
   - Repeat for ports 3000, 8000, 1935

**OBS Streaming (Public):**
- Server: `rtmp://123.456.789.123:1935/live`
- Stream Key: (from dashboard)

---

## 🔍 Verification Checklist

### Basic Setup
- [ ] Node.js installed
- [ ] All dependencies installed (`npm install`)
- [ ] MongoDB running (optional)

### Local Network
- [ ] Found local IP address
- [ ] Updated server/.env with local IP
- [ ] Updated client/.env with local IP
- [ ] Firewall rules added
- [ ] Can access from phone (same WiFi)

### Public Internet
- [ ] Found public IP address
- [ ] Router admin access obtained
- [ ] Port 3000 forwarded (Frontend)
- [ ] Port 5000 forwarded (Backend)
- [ ] Port 8000 forwarded (Media)
- [ ] Port 1935 forwarded (RTMP)
- [ ] Updated server/.env with public IP
- [ ] Updated client/.env with public IP
- [ ] Ports verified as "Open" online
- [ ] Can access from mobile data

### Streaming
- [ ] RTMP server running
- [ ] OBS connected successfully
- [ ] Stream appears on website
- [ ] Multiple viewers can watch
- [ ] Chat works in real-time

---

## 🛠️ Troubleshooting

### Problem: Can't Find Router IP

**Try these addresses:**
```powershell
# PowerShell
ipconfig | findstr "Gateway"
```
The "Default Gateway" is your router IP

### Problem: Forgot Router Password

**Solutions:**
1. Check router label/sticker
2. Check ISP documentation
3. Try: admin/admin, admin/password
4. Last resort: Factory reset router (hold reset button 10 seconds)

### Problem: Port Forwarding Not Working

**Check:**
1. **Double NAT Issue:**
   - Your ISP might use Carrier-Grade NAT
   - Call ISP and ask for "true public IP"
   - Or use alternative (see below)

2. **UPnP Disabled:**
   - Enable UPnP in router settings
   - Easier automatic port forwarding

3. **ISP Blocks Ports:**
   - Some ISPs block ports 80, 443, 25
   - Ports 3000, 5000, 8000, 1935 usually fine
   - Contact ISP if blocked

### Problem: IP Address Keeps Changing

**Solutions:**

1. **Static IP (Router Level):**
   - Router Settings → DHCP → Address Reservation
   - Assign permanent IP to your computer's MAC address

2. **Dynamic DNS (Free):**
   - No-IP.com (free)
   - DuckDNS.org (free)
   - Get domain like: mystream.ddns.net
   - Update client/.env to use domain instead of IP

3. **Static Public IP from ISP:**
   - Call ISP, request static IP
   - Usually $5-10/month
   - Best for professional setup

### Problem: Slow or Choppy Streaming

**Check:**
1. **Upload Speed:**
   - Need 5+ Mbps for 720p
   - Need 10+ Mbps for 1080p
   - Test: https://fast.com/

2. **Reduce OBS Bitrate:**
   - OBS → Settings → Output
   - Video Bitrate: 2500 kbps (720p) or 4500 kbps (1080p)

3. **Reduce Resolution:**
   - OBS → Settings → Video
   - Output Resolution: 1280x720

---

## 🌐 Alternative Solutions

### If Port Forwarding Fails

**Option 1: Cloudflare Tunnel (Free, Easiest)**
```powershell
# Install Cloudflare Tunnel
winget install --id=Cloudflare.cloudflared -e

# Create tunnel
cloudflared tunnel create kicky

# Configure tunnel
# Follow: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
```

**Benefits:**
- No port forwarding needed
- Free SSL/HTTPS
- DDoS protection
- Works behind any router

**Option 2: Ngrok (Free for testing)**
```powershell
# Download ngrok: https://ngrok.com/download

# Start tunnels
ngrok http 3000  # Frontend
ngrok http 5000  # Backend
ngrok http 8000  # Media
ngrok tcp 1935   # RTMP
```

**Option 3: Deploy to Cloud**
- **Frontend:** Vercel, Netlify (free)
- **Backend:** Heroku, Railway (free tier)
- **Database:** MongoDB Atlas (free)
- **RTMP:** DigitalOcean ($5/month)

---

## 📊 Network Diagram

```
[Internet] 
    ↓
[Your Router:Public IP] ← Port Forwarding
    ↓
[Your Computer:192.168.1.100]
    ├─ Frontend  :3000
    ├─ Backend   :5000
    ├─ Media     :8000
    └─ RTMP      :1935
```

---

## 🎓 Understanding Ports

| Port | Service | Why? |
|------|---------|------|
| 3000 | React Frontend | Users visit website |
| 5000 | Express Backend | API requests, authentication |
| 8000 | HLS Media | Video streaming (HLS format) |
| 1935 | RTMP | OBS sends video here |

---

## 🔐 Security Tips

1. **Change Default Router Password**
2. **Use Strong JWT Secret** (in server/.env)
3. **Enable HTTPS** (use Cloudflare or Let's Encrypt)
4. **Regular Updates** (keep Node.js and packages updated)
5. **Monitor Access** (check who's connecting)
6. **Rate Limiting** (prevent abuse)
7. **Backup MongoDB** (if using database)

---

## ✅ Success!

If you can:
1. ✓ Access from your computer
2. ✓ Access from phone on same WiFi
3. ✓ Access from friend's computer
4. ✓ Stream with OBS
5. ✓ Chat works in real-time

**Congratulations! Your streaming platform is live! 🎉**

---

## 📞 Need Help?

1. Check logs: Look for errors in console
2. Test step-by-step: Local → Network → Public
3. Use online port checker
4. Check router firewall settings
5. Verify ISP doesn't block ports
6. Consider alternative solutions (Cloudflare Tunnel)

**Remember:** Keep your computer running 24/7 for continuous availability, or consider cloud hosting for production!

