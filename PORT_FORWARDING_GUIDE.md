# 🌐 Port Forwarding Guide - Enable Worldwide Access

## 🎯 **Goal:**
Allow ANYONE worldwide to:
- ✅ Visit your website
- ✅ Create accounts
- ✅ Stream from OBS
- ✅ Watch streams
- ✅ Chat and interact

---

## 📋 **What You Need to Forward:**

| Service | External Port | Internal IP | Internal Port | Protocol |
|---------|---------------|-------------|---------------|----------|
| Website | 3000 | 10.8.0.250 | 3000 | TCP |
| Backend API | 5000 | 10.8.0.250 | 5000 | TCP |
| Video/HLS | 8888 | 10.8.0.250 | 8888 | TCP |
| RTMP (OBS) | 1935 | 10.8.0.250 | 1935 | TCP |

**Internal IP:** 10.8.0.250 (your computer)  
**External IP:** 72.23.212.188 (your public IP)

---

## 🔧 **Step-by-Step Setup:**

### **Step 1: Access Your Router**

1. Open web browser
2. Go to one of these (most common):
   - http://192.168.1.1
   - http://192.168.0.1
   - http://10.0.0.1
   - (Check router sticker for IP)

3. Login:
   - Username: admin (or Admin)
   - Password: admin / password / (on router sticker)

### **Step 2: Find Port Forwarding Settings**

Look for these menu items:
- "Port Forwarding"
- "Virtual Server"
- "NAT Forwarding"
- "Applications & Gaming"
- "Advanced" → "Port Forwarding"

### **Step 3: Add Port Forwarding Rules**

**Add 4 rules (one for each port):**

#### **Rule 1: Website**
```
Service Name: AURA-Website
External Port: 3000
Internal IP: 10.8.0.250
Internal Port: 3000
Protocol: TCP (or Both)
Enable: ✓
```

#### **Rule 2: Backend API**
```
Service Name: AURA-API
External Port: 5000
Internal IP: 10.8.0.250
Internal Port: 5000
Protocol: TCP (or Both)
Enable: ✓
```

#### **Rule 3: Video Streaming**
```
Service Name: AURA-Video
External Port: 8888
Internal IP: 10.8.0.250
Internal Port: 8888
Protocol: TCP (or Both)
Enable: ✓
```

#### **Rule 4: RTMP (OBS)**
```
Service Name: AURA-RTMP
External Port: 1935
Internal IP: 10.8.0.250
Internal Port: 1935
Protocol: TCP (or Both)
Enable: ✓
```

### **Step 4: Save and Apply**

- Click "Save" or "Apply"
- Router might restart (wait 2 minutes)

---

## 🧪 **Testing:**

### **Test 1: From Phone (Mobile Data)**

**IMPORTANT:** Use mobile data, NOT WiFi!

1. On phone, turn OFF WiFi
2. Use mobile data
3. Open browser
4. Go to: http://72.23.212.188:3000

**✅ Success:** Website loads  
**❌ Failed:** Connection refused = port forwarding not working

### **Test 2: From Another Computer**

1. Use a friend's computer (not on your network)
2. Go to: http://72.23.212.188:3000

### **Test 3: Online Port Checker**

1. Go to: https://www.yougetsignal.com/tools/open-ports/
2. Remote Address: 72.23.212.188
3. Port Number: 3000
4. Click "Check"
5. Should say: "Port 3000 is open"

Repeat for ports 5000, 8888, 1935.

---

## 🔥 **Common Router Brands:**

### **Netgear:**
```
Advanced → Setup → Port Forwarding
```

### **TP-Link:**
```
Forwarding → Virtual Servers → Add New
```

### **Linksys:**
```
Applications & Gaming → Port Range Forwarding
```

### **ASUS:**
```
WAN → Virtual Server / Port Forwarding
```

### **D-Link:**
```
Advanced → Port Forwarding
```

---

## ⚠️ **Important Notes:**

### **Keep Your Computer On:**
- Your computer MUST be running for the service to work
- Keep servers running (backend, frontend, RTMP)

### **Firewall:**
```
Windows Firewall might block ports!

Fix:
1. Windows Defender Firewall
2. Advanced settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000,5000,8888,1935
5. Allow the connection
6. Apply to all profiles
```

### **Static IP for Your Computer:**

Your computer's IP (10.8.0.250) might change! Make it static:

**Option A: Router DHCP Reservation**
1. Router settings
2. DHCP Reservation or Static IP
3. Assign 10.8.0.250 to your computer's MAC address

**Option B: Windows Static IP**
1. Network settings
2. Change adapter options
3. IPv4 Properties
4. Manual IP: 10.8.0.250
5. Subnet: 255.255.255.0
6. Gateway: 192.168.1.1 (your router)

---

## 🌍 **After Port Forwarding:**

### **Anyone Can:**

**Visit Website:**
```
http://72.23.212.188:3000
```

**Create Account:**
- Click Register
- Username, email, password
- Login

**Stream from OBS:**
```
Server: rtmp://72.23.212.188:1935/live
Stream Key: (from their dashboard)
```

**Watch Streams:**
- Anyone can watch live streams
- No account needed to watch
- Account needed to chat/follow

---

## 🔒 **Security:**

### **Keep Safe:**
- ✅ Change admin password (Jazey / 1919)
- ✅ Use strong passwords
- ✅ Monitor who streams
- ✅ Ban troublemakers in admin panel
- ✅ Keep Windows updated
- ✅ Use firewall

### **Optional - Use Domain Name:**

Instead of sharing 72.23.212.188:
1. Register domain (example: aurastream.com)
2. Point A record to 72.23.212.188
3. Share: http://aurastream.com:3000

---

## 📊 **Expected Load:**

Your internet upload speed determines quality:

| Upload Speed | Max Streamers | Max Viewers |
|--------------|---------------|-------------|
| 10 Mbps | 1-2 | 20-30 |
| 25 Mbps | 3-5 | 50-100 |
| 50 Mbps | 5-10 | 100-200 |
| 100 Mbps | 10-20 | 200-500 |

**Your PC specs matter too!** Monitor CPU/RAM usage.

---

## ✅ **Final Checklist:**

Before sharing with friends:

- [ ] Port forwarding configured (4 ports)
- [ ] Router settings saved and applied
- [ ] Tested from phone (mobile data)
- [ ] Port checker shows ports open
- [ ] Windows Firewall allows Node.js
- [ ] Computer has static IP (10.8.0.250)
- [ ] Ran SETUP_PUBLIC_INTERNET.bat
- [ ] Ran RESTART_CLEAN.bat
- [ ] Website loads from phone
- [ ] Can create account from phone
- [ ] Streaming works

---

## 🚀 **Go Live:**

```bash
# 1. Configure for public access
.\SETUP_PUBLIC_INTERNET.bat

# 2. Restart everything
.\RESTART_CLEAN.bat

# 3. Share with the world!
http://72.23.212.188:3000
```

**That's it! Your platform is now WORLDWIDE!** 🌍🎉

