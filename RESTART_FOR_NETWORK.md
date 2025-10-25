# 🔄 Restart Instructions for Network Access

## ⚠️ IMPORTANT: You must restart the servers!

The configuration has been updated, but the frontend is still using the old settings.

## 🛑 Step 1: Stop Current Servers

In the terminal where `START_ALL.bat` is running:
1. Press `Ctrl+C`
2. Wait for all processes to stop

## ▶️ Step 2: Restart Everything

```bash
START_ALL.bat
```

## 📱 Step 3: Access from Network

After restart, open your browser to:
```
http://10.8.0.250:3000
```

**NOT** `http://localhost:3000` (that won't work with the new config)

## 🔑 Step 4: Login as Admin

On the login page at `http://10.8.0.250:3000/login`:
- Username: `Jazey`
- Password: `1919`
- Click "Login"

## 🎥 Step 5: Your Stream Will Appear!

After logging in and restarting your stream in OBS, it will show on the home page.

---

## 🔧 What Changed?

**Backend (server/config.env):**
- `PUBLIC_IP=10.8.0.250`
- `CORS_ORIGIN=http://localhost:3000,http://10.8.0.250:3000`
- `API_SERVER=http://10.8.0.250:5000`
- `HTTP_MEDIA_PORT=8888`

**Frontend (client/.env):**
- `REACT_APP_API_URL=http://10.8.0.250:5000`
- `REACT_APP_SOCKET_URL=http://10.8.0.250:5000`
- `REACT_APP_MEDIA_URL=http://10.8.0.250:8888`

---

## 📝 Quick Checklist:

- [ ] Stop current servers (Ctrl+C)
- [ ] Run `START_ALL.bat`
- [ ] Open `http://10.8.0.250:3000` (NOT localhost)
- [ ] Login with Jazey/1919
- [ ] Check home page for your stream

## 🚨 If Stream Still Doesn't Show:

1. Make sure you're logged in (dashboard shows your stream key)
2. Stop and restart your OBS stream
3. Wait 5-10 seconds for it to appear on home page
4. Check browser console for any errors (F12)
5. Make sure you disabled ad blockers for this IP address

---

**TIP:** Bookmark `http://10.8.0.250:3000` to always use network access!

