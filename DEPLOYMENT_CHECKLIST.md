# 📋 DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Checklist

Before pushing to GitHub and deploying:

- [x] `.gitignore` file created ✅
- [ ] Git initialized
- [ ] Code committed to Git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Render.com account created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Environment variables configured
- [ ] Site tested and working

---

## 🎯 QUICK START GUIDE

### **Step 1: Push to GitHub**

Run this script:
```bash
.\PUSH_TO_GITHUB.bat
```

Then:
1. Go to: https://github.com/new
2. Name: `aura-streaming`
3. Make it **PUBLIC**
4. Click **"Create repository"**

Then run:
```bash
git remote add origin https://github.com/jazeyttv/aura-streaming.git
git branch -M main
git push -u origin main
```

**✅ Your username (jazeyttv) is already filled in!**

---

### **Step 2: MongoDB Atlas (Free Database)**

1. **Go to:** https://mongodb.com/cloud/atlas
2. **Sign up** with Google (easiest)
3. **Create Cluster:**
   - Choose AWS
   - Select FREE (M0)
   - Click "Create Cluster"
   - Wait 2-3 minutes

4. **Create User:**
   - Security → Database Access
   - Add New Database User
   - Username: `aura_admin`
   - **Autogenerate password** → **COPY IT!**
   - Save it here: ___________________________

5. **Allow All IPs:**
   - Security → Network Access
   - Add IP Address
   - Allow Access from Anywhere
   - IP: `0.0.0.0/0`

6. **Get Connection String:**
   - Database → Connect
   - Connect your application
   - Copy this:
   ```
   mongodb+srv://aura_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **Replace `<password>` with your actual password!**
   - Save it here: ___________________________

---

### **Step 3: Deploy Backend (Render.com)**

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **New + → Web Service**
4. **Connect** `aura-streaming` repo
5. **Configure:**
   - Name: `aura-backend`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: **Free**

6. **Environment Variables** (click Advanced):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
   JWT_SECRET=aura_super_secret_2024_random_string
   CORS_ORIGIN=*
   PUBLIC_IP=0.0.0.0
   ```

7. **Click "Create Web Service"**
8. **Wait 5-10 minutes**
9. **Copy your backend URL:**
   ```
   https://aura-backend-xxxx.onrender.com
   ```
   Save it here: ___________________________

---

### **Step 4: Deploy Frontend (Render.com)**

1. **New + → Static Site**
2. **Connect** same `aura-streaming` repo
3. **Configure:**
   - Name: `aura-frontend`
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

4. **Environment Variables** (click Advanced):
   ```
   REACT_APP_API_URL=YOUR_BACKEND_URL_HERE
   REACT_APP_SOCKET_URL=YOUR_BACKEND_URL_HERE
   REACT_APP_MEDIA_URL=YOUR_BACKEND_URL_HERE
   ```
   
   **Replace with your backend URL from Step 3!**

5. **Click "Create Static Site"**
6. **Wait 5-10 minutes**
7. **Your site is live!**
   ```
   https://aura-frontend-xxxx.onrender.com
   ```
   Save it here: ___________________________

---

## 🎊 YOU'RE LIVE!

**Share your link:**
```
https://aura-frontend-xxxx.onrender.com
```

**Test it:**
- [ ] Site loads
- [ ] Can register
- [ ] Can login
- [ ] Search works
- [ ] Chat works
- [ ] Everything works!

---

## 📝 Important URLs

**Save these for reference:**

| Service | URL | Notes |
|---------|-----|-------|
| GitHub Repo | https://github.com/YOUR_USERNAME/aura-streaming | Your code |
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| Render Dashboard | https://dashboard.render.com | Hosting |
| Backend URL | _______________________ | Fill in after deploy |
| Frontend URL | _______________________ | Fill in after deploy |

---

## 🆘 Troubleshooting

### **Backend won't start:**
- Check Render logs
- Verify MongoDB connection string
- Check all environment variables

### **Frontend can't connect:**
- Verify REACT_APP_API_URL is correct
- Make sure backend is running
- Check CORS settings

### **Database errors:**
- Check IP whitelist has 0.0.0.0/0
- Verify username/password
- Test connection string

---

## 📞 Need Help?

**Guides:**
- `DEPLOY_TO_RENDER_SIMPLE.md` - Full deployment guide
- `FREE_HOSTING_GUIDE.md` - All hosting options

**Docs:**
- Render: https://render.com/docs
- MongoDB: https://www.mongodb.com/docs/atlas/

---

## ✨ Good Luck!

You're about to deploy your streaming platform to the world! 🌍

Follow the steps one by one, and you'll be live in 20 minutes!

🚀 **Let's go!**

