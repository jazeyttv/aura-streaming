# 🎥 AURA - Live Streaming Platform

A full-featured live streaming platform similar to Kick.com, built with the MERN stack.

## ✨ Features

- 🎥 **Live Streaming** - RTMP/HLS streaming with OBS support
- 💬 **Real-time Chat** - WebSocket-based chat with custom colors
- 👥 **User System** - Registration, authentication, profiles
- 🔍 **Search** - Find users and live streams
- ⭐ **Partner System** - Verified partner badges
- 💎 **Affiliate System** - Subscriber features
- 👑 **Admin Dashboard** - User management, moderation
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Neon Futuristic Theme** - Kick-inspired UI

## 🚀 Quick Start

### **Local Development:**

```bash
# Install dependencies
npm install

# Start development servers
npm start
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000  
RTMP: rtmp://localhost:1935/live

### **Deploy to Internet:**

See `DEPLOY_TO_RENDER_SIMPLE.md` for full deployment guide.

**Quick version:**
1. Push code to GitHub
2. Setup MongoDB Atlas (free)
3. Deploy to Render.com (free)
4. Get free domain: `aura-yourname.onrender.com`

## 📚 Documentation

- `DEPLOY_TO_RENDER_SIMPLE.md` - Deployment guide
- `FREE_HOSTING_GUIDE.md` - All hosting options
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `NO_MORE_CACHE_ISSUES.md` - Cache busting system
- `SEARCH_AND_HOSTING_COMPLETE.md` - Search feature guide

## 🛠️ Tech Stack

**Frontend:**
- React
- Socket.IO Client
- HLS.js
- Axios
- React Router

**Backend:**
- Node.js
- Express
- MongoDB
- Socket.IO
- Node Media Server
- JWT Authentication

## 🎯 Admin Access

Default admin credentials:
- Username: `Jazey`
- Password: `1919`

**Change these after first login!**

## 📝 Environment Variables

### **Backend (`server/config.env`):**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kicky
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
PUBLIC_IP=10.8.0.250
```

### **Frontend (`client/.env`):**

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MEDIA_URL=http://localhost:8888
```

## 🎥 Streaming Setup

1. **Get your stream key** from Dashboard
2. **Open OBS Studio**
3. **Settings → Stream:**
   - Service: Custom
   - Server: `rtmp://YOUR_IP:1935/live`
   - Stream Key: (from dashboard)
4. **Start Streaming!**

## 🌐 Network Access

**Local Network:**
- Access from WiFi: `http://10.8.0.250:3000`

**Public Internet:**
- Port forward: 3000, 5000, 1935, 8888
- Access from anywhere: `http://YOUR_PUBLIC_IP:3000`

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/jazeyttv/aura-streaming.git
cd aura-streaming

# Install all dependencies
npm install

# Start development
npm start
```

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 🆘 Support

Having issues? Check:
- `TROUBLESHOOTING.md` - Common issues
- `DEPLOYMENT_CHECKLIST.md` - Deployment help
- GitHub Issues

## 🎉 Credits

Built with inspiration from Kick.com and Twitch.

## 🚀 Deploy Now

Ready to go live?

**Run this:**
```bash
.\PUSH_TO_GITHUB.bat
```

Then follow: `DEPLOY_TO_RENDER_SIMPLE.md`

Your streaming platform will be live in 20 minutes! 🌍

---

**Made with 💜 by the AURA Team**

*Stream. Chat. Connect.*
