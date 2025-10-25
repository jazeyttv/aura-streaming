# Installation Instructions for Kicky Streaming Platform

## 🚀 Easy Installation (Windows)

### Method 1: Using the Batch File (Easiest)

1. **Double-click `START.bat`** in the Kicky folder
   - This will automatically install dependencies and start the application
   - Wait for it to complete (may take a few minutes first time)
   - Your browser will open automatically at http://localhost:3000

### Method 2: Manual Installation

1. **Open PowerShell in the Kicky folder**
   - Right-click in the folder → "Open PowerShell window here"
   - Or: File Explorer address bar → type `powershell` → Enter

2. **Run these commands one by one:**

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install

# Go back to root
cd ..

# Start the application
npm run dev
```

## 📋 What Gets Installed

The installation will download and install:

### Backend Dependencies:
- Express.js - Web server framework
- Socket.IO - Real-time communication
- MongoDB/Mongoose - Database (optional)
- JWT - Authentication tokens
- Bcrypt - Password encryption
- CORS - Cross-origin support

### Frontend Dependencies:
- React 18 - UI library
- React Router - Navigation
- Axios - HTTP requests
- Socket.IO Client - Real-time chat
- Lucide React - Beautiful icons

**Total Size:** Approximately 300-400 MB

## ⚙️ Configuration

### Environment Variables

After installation, copy `server/config.env` to `server/.env`:

```powershell
cd server
copy config.env .env
cd ..
```

Edit `server/.env` if you need to change:
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Change this for security!
- `MONGODB_URI` - Your MongoDB connection string

## 🗄️ Database Setup (Optional)

The app works WITHOUT MongoDB using in-memory storage, but data will be lost when you restart.

### Install MongoDB for Permanent Storage:

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Choose Windows x64 version
   - Download and run installer

2. **Installation Options:**
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (optional GUI)
   - Click Install

3. **Verify Installation:**
```powershell
mongo --version
```

4. **Start MongoDB Service** (if not auto-started):
   - Press Win+R
   - Type: `services.msc`
   - Find "MongoDB Server"
   - Right-click → Start

## 🔍 Verify Installation

After running `npm run dev`, you should see:

```
✓ Compiled successfully!
🚀 Server running on http://localhost:5000
📺 Kicky Streaming Platform
✅ MongoDB connected successfully (if MongoDB is installed)
⚠️  MongoDB connection failed, using in-memory storage (if MongoDB is not installed)
```

Open your browser to:
- **Frontend:** http://localhost:3000
- **Backend Health Check:** http://localhost:5000/api/health

## 🛠️ Troubleshooting Installation

### Error: "npm is not recognized"
**Solution:** Node.js is not installed or not in PATH
1. Download and install Node.js from https://nodejs.org/
2. Restart PowerShell after installation
3. Verify with `node --version`

### Error: "EACCES: permission denied"
**Solution:** Run PowerShell as Administrator
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try installation again

### Error: "Cannot find module"
**Solution:** Dependencies not fully installed
```powershell
# Clean install everything
rm -r node_modules, client/node_modules, server/node_modules
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Error: "Port 3000 or 5000 already in use"
**Solution:** Another application is using the port
1. Close other development servers
2. Or change ports:
   - Backend: Edit `server/.env` → Change `PORT=5000` to another port
   - Frontend: Edit `client/package.json` → Change `"proxy": "http://localhost:5000"`

### Installation is Very Slow
**Solution:** This is normal for first-time installation
- node_modules can be 300-400 MB
- Slower internet connections may take 5-10 minutes
- Be patient and let it complete

### MongoDB Won't Connect
**Solution:** MongoDB service not running
1. Open Services (Win+R → services.msc)
2. Find "MongoDB Server"
3. Right-click → Start
4. Restart Kicky app

## 📦 What's Installed Where

```
Kicky/
├── node_modules/          # Root dependencies (concurrently)
├── server/
│   └── node_modules/      # Backend dependencies (~150 MB)
├── client/
│   └── node_modules/      # Frontend dependencies (~250 MB)
```

## 🔄 Updating Dependencies

To update all packages to latest versions:

```powershell
# Update root
npm update

# Update server
cd server
npm update

# Update client
cd ../client
npm update
```

## 🗑️ Uninstalling

To remove all installed dependencies:

```powershell
# Delete node_modules folders
rm -r -force node_modules
rm -r -force server/node_modules
rm -r -force client/node_modules

# Optional: Delete package-lock files
rm package-lock.json
rm server/package-lock.json
rm client/package-lock.json
```

## ✅ Installation Checklist

- [ ] Node.js installed (v16+)
- [ ] npm available in terminal
- [ ] Root dependencies installed
- [ ] Server dependencies installed
- [ ] Client dependencies installed
- [ ] MongoDB installed (optional)
- [ ] Environment variables configured
- [ ] Application starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can create an account
- [ ] Can start a stream (for streamers)

## 🎉 Next Steps

Once installation is complete:

1. **Create an Account**
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Fill in details
   - Check "I want to be a streamer" if streaming

2. **Start Streaming**
   - Login with your account
   - Go to Dashboard
   - Set up your stream details
   - Click "Go Live"

3. **Test as Viewer**
   - Open incognito/private window
   - Create second account
   - View streams on homepage
   - Test chat functionality

---

Need more help? Check out:
- **SETUP_GUIDE.md** - Detailed usage guide
- **README.md** - Full documentation

