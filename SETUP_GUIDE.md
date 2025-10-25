# Kicky - Quick Setup Guide

## 🎯 Quick Start (5 Minutes)

Follow these simple steps to get Kicky running on your computer:

### Step 1: Install Node.js (If not already installed)

**Windows:**
1. Visit https://nodejs.org/
2. Download the LTS version
3. Run the installer
4. Verify installation: Open PowerShell and run `node --version`

### Step 2: Open Terminal in Project Folder

**Windows PowerShell:**
1. Open the Kicky folder in File Explorer
2. Click in the address bar, type `powershell`, and press Enter

### Step 3: Install All Dependencies

Run this single command:
```bash
npm install && cd server && npm install && cd ../client && npm install && cd ..
```

This will install all required packages for the entire project.

### Step 4: Start the Application

From the main Kicky folder, run:
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📺 Kicky Streaming Platform
```

And the browser will automatically open at http://localhost:3000

### Step 5: Create Your Account

1. Click "Sign Up" in the top right
2. Fill in the registration form
3. Check "I want to be a streamer" if you want to stream
4. Click "Sign Up"

### Step 6: Start Streaming (For Streamers)

1. Click "Dashboard" in the navigation menu
2. Fill in your stream details:
   - Title: "My First Stream"
   - Description: "Testing Kicky streaming!"
   - Category: Choose one
3. Click "Go Live"
4. Allow camera/microphone access when prompted
5. You're now live! 🎉

### Step 7: View Your Stream

1. Click "View Stream" button in the dashboard
2. Or open http://localhost:3000 in another browser/incognito window
3. You should see your stream on the homepage!

## 🎮 Testing the Platform

### Test as a Viewer:
1. Open http://localhost:3000 in an incognito/private window
2. Create a second account (don't check streamer option)
3. Click on any live stream
4. Test the chat functionality

### Test Chat:
1. With one account streaming and another viewing
2. Type messages in the chat
3. They should appear in real-time!

## 📱 What You Can Do

### As a Viewer:
- ✅ Browse live streams on homepage
- ✅ Watch any stream
- ✅ Chat with other viewers
- ✅ View streamer profiles
- ✅ Edit your own profile

### As a Streamer:
- ✅ All viewer features, plus:
- ✅ Access creator dashboard
- ✅ Start/stop streams
- ✅ See real-time viewer count
- ✅ Monitor chat
- ✅ Configure stream settings

## ⚙️ Optional: Install MongoDB (For Data Persistence)

Without MongoDB, your data resets when you restart the server. To keep data permanently:

### Windows:
1. Visit https://www.mongodb.com/try/download/community
2. Download "MongoDB Community Server"
3. Run installer (choose "Complete" installation)
4. Check "Install MongoDB as a Service"
5. Install MongoDB Compass (optional GUI)
6. MongoDB will start automatically

After installing MongoDB:
1. Stop the Kicky app (Ctrl+C in terminal)
2. Restart with `npm run dev`
3. You should see: `✅ MongoDB connected successfully`

## 🛑 Common Issues & Fixes

### Issue: "Port already in use"
**Solution:** Another app is using port 3000 or 5000
- Close other development servers
- Or change ports in configuration files

### Issue: "Cannot find module"
**Solution:** Dependencies not installed
```bash
cd client
npm install
cd ../server
npm install
```

### Issue: Camera/Microphone not working
**Solution:** Grant browser permissions
- Click the camera icon in browser address bar
- Select "Allow"
- Refresh the page

### Issue: "CORS error"
**Solution:** Make sure both frontend and backend are running
- Backend should be on http://localhost:5000
- Frontend should be on http://localhost:3000

### Issue: Chat messages not appearing
**Solution:** Socket.IO connection issue
- Check browser console for errors
- Make sure backend is running
- Refresh the page

## 🎯 Architecture Overview

```
Your Computer
├── Backend Server (Port 5000)
│   ├── Express API
│   ├── Socket.IO (real-time chat)
│   ├── MongoDB (optional database)
│   └── Authentication system
│
└── Frontend Client (Port 3000)
    ├── React UI
    ├── Video streaming
    ├── Chat interface
    └── User dashboard
```

## 🔧 Customization

### Change Site Colors:
Edit `client/src/index.css` and `client/src/App.css`
- Primary color: `#53fc18` (green)
- Background: `#0f0f0f` (dark)

### Add Stream Categories:
Edit `client/src/pages/Dashboard.js` - line with `<select>` options

### Modify Chat Features:
Edit `client/src/pages/StreamView.js` and `server/server.js`

## 🌐 Access from Other Devices (Same Network)

1. Find your computer's IP address:
   - Windows: `ipconfig` in PowerShell (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Other devices can access:
   - Frontend: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

## 📚 Next Steps

1. **Explore the Code:** Check out the project structure
2. **Customize:** Change colors, add features
3. **Deploy:** Put it online using Heroku, Vercel, etc.
4. **Learn:** This is a great project to learn from!

## 💬 Need Help?

If you run into issues:
1. Check the main README.md for detailed documentation
2. Look at console errors in the browser (F12)
3. Check terminal output for server errors
4. Make sure all dependencies are installed

---

🎉 **Enjoy your streaming platform!** 🎉

