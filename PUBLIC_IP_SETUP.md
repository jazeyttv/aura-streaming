# Public IP Setup Guide for Kicky Streaming Platform

This guide will help you configure Kicky to work on your public IP address, making it accessible from anywhere on the internet.

## 🌐 Quick Start

### Step 1: Find Your IP Addresses

#### Find Your Local Network IP:
**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (usually 192.168.x.x or 10.0.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

#### Find Your Public IP:
Visit: https://whatismyipaddress.com/
Or run:
```powershell
curl ifconfig.me
```

### Step 2: Configure Server

Edit `server/config.env` or `server/.env`:

```env
# For local network access (other devices on same WiFi)
PUBLIC_IP=192.168.1.100  # Your local IP

# For internet access (from anywhere)
PUBLIC_IP=your-public-ip-here  # Your public IP

# Update CORS to allow your frontend
CORS_ORIGIN=http://192.168.1.100:3000,http://your-public-ip:3000
```

### Step 3: Configure Client

Create `client/.env`:

```env
# For local network
REACT_APP_API_URL=http://192.168.1.100:5000
REACT_APP_SOCKET_URL=http://192.168.1.100:5000
REACT_APP_MEDIA_URL=http://192.168.1.100:8000

# For public internet
# REACT_APP_API_URL=http://your-public-ip:5000
# REACT_APP_SOCKET_URL=http://your-public-ip:5000
# REACT_APP_MEDIA_URL=http://your-public-ip:8000
```

### Step 4: Port Forwarding (For Public Internet Access)

You need to forward these ports in your router:

| Port | Service | Protocol |
|------|---------|----------|
| 3000 | Frontend (React) | TCP |
| 5000 | Backend API | TCP |
| 8000 | HLS Media Server | TCP |
| 1935 | RTMP Streaming | TCP |

#### How to Forward Ports:

1. **Access Your Router:**
   - Open browser: http://192.168.1.1 or http://192.168.0.1
   - Login with router credentials (often on router label)

2. **Find Port Forwarding Settings:**
   - Look for: "Port Forwarding", "Virtual Server", or "NAT"
   - Usually under "Advanced" or "Security" section

3. **Add Port Forwarding Rules:**

   **Frontend:**
   - External Port: 3000
   - Internal Port: 3000
   - Internal IP: Your computer's local IP (192.168.x.x)
   - Protocol: TCP

   **Backend:**
   - External Port: 5000
   - Internal Port: 5000
   - Internal IP: Your computer's local IP
   - Protocol: TCP

   **Media Server:**
   - External Port: 8000
   - Internal Port: 8000
   - Internal IP: Your computer's local IP
   - Protocol: TCP

   **RTMP:**
   - External Port: 1935
   - Internal Port: 1935
   - Internal IP: Your computer's local IP
   - Protocol: TCP

4. **Save and Apply Changes**

### Step 5: Windows Firewall

Allow ports through Windows Firewall:

```powershell
# Run PowerShell as Administrator

# Allow Backend
netsh advfirewall firewall add rule name="Kicky Backend" dir=in action=allow protocol=TCP localport=5000

# Allow Frontend
netsh advfirewall firewall add rule name="Kicky Frontend" dir=in action=allow protocol=TCP localport=3000

# Allow Media Server
netsh advfirewall firewall add rule name="Kicky Media" dir=in action=allow protocol=TCP localport=8000

# Allow RTMP
netsh advfirewall firewall add rule name="Kicky RTMP" dir=in action=allow protocol=TCP localport=1935
```

### Step 6: Start the Servers

```powershell
# Terminal 1: Start backend and frontend
npm run dev

# Terminal 2: Start RTMP media server
cd server
npm run media-server
```

## 📱 Access Your Platform

### From Same WiFi Network:
- **Frontend:** http://YOUR_LOCAL_IP:3000
- **Example:** http://192.168.1.100:3000

### From Internet (Anywhere):
- **Frontend:** http://YOUR_PUBLIC_IP:3000
- **Example:** http://123.456.789.123:3000

### OBS Streaming Setup:
- **Local Network:** rtmp://YOUR_LOCAL_IP:1935/live
- **Internet:** rtmp://YOUR_PUBLIC_IP:1935/live

## 🔧 Testing Your Setup

### Test 1: Local Network Access

1. On your computer, go to: http://localhost:3000 ✓
2. On your phone (same WiFi), go to: http://YOUR_LOCAL_IP:3000 ✓
3. If both work, local network is configured correctly!

### Test 2: Port Forwarding

Use online port checker: https://www.yougetsignal.com/tools/open-ports/

Check if these ports are open:
- Port 5000 (Backend)
- Port 3000 (Frontend)
- Port 1935 (RTMP)

### Test 3: Public Access

1. Disconnect from WiFi, use mobile data
2. Go to: http://YOUR_PUBLIC_IP:3000
3. If it loads, you're fully configured!

## 🚀 Production Deployment (Optional)

For a more professional setup:

### Option 1: Use a Domain Name

1. Buy a domain from Namecheap, GoDaddy, etc.
2. Point domain to your public IP
3. Update .env files:
   ```env
   REACT_APP_API_URL=http://yourdomain.com:5000
   ```

### Option 2: Use Cloudflare Tunnel (Free)

Cloudflare Tunnel bypasses port forwarding:

1. Install cloudflared
2. Run: `cloudflared tunnel create kicky`
3. Configure tunnel for ports 3000, 5000, 8000, 1935
4. Get free subdomain: kicky.yourusername.workers.dev

### Option 3: Deploy to Cloud

**Backend + Database:**
- Heroku (free tier)
- Railway.app (free tier)
- DigitalOcean ($5/month)

**Frontend:**
- Vercel (free)
- Netlify (free)
- GitHub Pages (free)

**Media Server:**
- AWS EC2 or DigitalOcean for RTMP

## 🔒 Security Recommendations

1. **Change JWT Secret:**
   ```env
   JWT_SECRET=create_a_very_long_random_string_here_minimum_32_characters
   ```

2. **Use HTTPS (SSL Certificate):**
   - Let's Encrypt (free SSL)
   - Cloudflare (free SSL proxy)

3. **Add Rate Limiting:**
   - Prevents DDoS attacks
   - Install: `npm install express-rate-limit`

4. **Enable MongoDB Authentication:**
   - Don't expose MongoDB to public
   - Use MongoDB Atlas (cloud, free tier)

5. **Use Environment Variables:**
   - Never commit .env files
   - Keep secrets secret!

## 🐛 Troubleshooting

### Problem: Can't Access from Other Devices

**Solutions:**
1. Check firewall settings
2. Verify both devices on same WiFi
3. Try disabling Windows Firewall temporarily (testing only!)
4. Check if antivirus is blocking ports

### Problem: Port Forwarding Not Working

**Solutions:**
1. Check if router supports UPnP (enable it)
2. Verify internal IP hasn't changed (use static IP)
3. Some ISPs block certain ports (contact ISP)
4. Try different external ports (e.g., 8080 instead of 3000)

### Problem: Public IP Keeps Changing

**Solutions:**
1. Buy static IP from ISP ($5-10/month)
2. Use Dynamic DNS (No-IP, DuckDNS - free)
3. Use Cloudflare Tunnel (free, no static IP needed)

### Problem: OBS Can't Connect to RTMP

**Solutions:**
1. Verify port 1935 is forwarded
2. Check firewall allows RTMP
3. Try rtmp://127.0.0.1:1935/live locally first
4. Check media server is running: `npm run media-server`

### Problem: Stream Not Playing in Browser

**Solutions:**
1. Check HLS server running on port 8000
2. Verify stream URL in browser dev tools
3. Try different browser (Chrome works best)
4. Check if FFmpeg is installed

## 📊 Bandwidth Requirements

Streaming requires good upload speed:

| Quality | Resolution | Bitrate | Upload Speed Needed |
|---------|------------|---------|---------------------|
| Low     | 480p       | 1 Mbps  | 2 Mbps             |
| Medium  | 720p       | 3 Mbps  | 5 Mbps             |
| High    | 1080p      | 6 Mbps  | 10 Mbps            |

Check your upload speed: https://fast.com/

## 📞 Getting Help

If you're stuck:

1. Check server logs for errors
2. Check browser console (F12) for errors
3. Verify all services are running:
   - Backend: http://localhost:5000/api/health
   - Media: http://localhost:8000
4. Try accessing locally first
5. Then try local network
6. Finally try public access

## 🎉 Success Checklist

- [ ] Server starts without errors
- [ ] Media server running
- [ ] Can access locally (localhost:3000)
- [ ] Can access from other device on WiFi
- [ ] Ports forwarded in router
- [ ] Firewall allows traffic
- [ ] Can access from internet (public IP)
- [ ] OBS can connect to RTMP
- [ ] Stream appears on website
- [ ] Chat works in real-time
- [ ] Multiple viewers can watch

## 🌟 Next Steps

Once everything works:

1. **Customize branding** - Change colors, logos
2. **Add moderators** - Give trusted users mod role
3. **Set up MongoDB** - For data persistence
4. **Get a domain** - Professional look
5. **Add SSL/HTTPS** - Secure connections
6. **Optimize streaming** - Adjust bitrates
7. **Monitor performance** - Check server load
8. **Backup data** - Regular database backups

---

**Remember:** Keep your computer/server running for 24/7 streaming platform access!

For best results, consider cloud hosting for production use.

