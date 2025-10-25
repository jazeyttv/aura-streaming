# 🚀 DEPLOY AURA TO RENDER - SUPER SIMPLE GUIDE

## ⚡ **Deploy in 10 Minutes + Get FREE Domain!**

---

## 📋 **Before You Start:**

✅ Have a GitHub account  
✅ AURA project ready  
✅ 10 minutes of time  

**You'll get:**
- 🌐 Free domain: `aura-yourname.onrender.com`
- 🔒 Free HTTPS
- 🌍 Worldwide access

---

## 🎯 **STEP 1: Push Code to GitHub (2 min)**

### **1. Create `.gitignore` file in root folder:**

```
node_modules/
.env
config.env
*.log
build/
dist/
.DS_Store
```

### **2. Open terminal and run:**

```bash
cd C:\Users\wydze\Desktop\Kicky

git init
git add .
git commit -m "Deploy AURA"
```

### **3. Create GitHub repo:**

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Name: `aura-streaming`
4. Make it **Public**
5. Click **"Create repository"**

### **4. Push code:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/aura-streaming.git
git branch -M main
git push -u origin main
```

✅ **Code is now on GitHub!**

---

## 🗄️ **STEP 2: Setup Free Database (3 min)**

### **1. Go to MongoDB Atlas:**

- Visit: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Click **"Try Free"**
- Sign up with Google (easiest)

### **2. Create Free Cluster:**

- Choose **AWS**
- Select **FREE tier (M0)**
- Pick region closest to you
- Click **"Create Cluster"**
- Wait 2-3 minutes

### **3. Create Database User:**

- Click **"Database Access"** (left sidebar)
- Click **"Add New Database User"**
- Username: `aura_admin`
- Password: Click **"Autogenerate Secure Password"** → **COPY IT!**
- Click **"Add User"**

### **4. Allow All IPs:**

- Click **"Network Access"** (left sidebar)
- Click **"Add IP Address"**
- Click **"Allow Access from Anywhere"**
- IP: `0.0.0.0/0`
- Click **"Confirm"**

### **5. Get Connection String:**

- Go back to **"Database"**
- Click **"Connect"**
- Choose **"Connect your application"**
- Copy the connection string (looks like this):
  ```
  mongodb+srv://aura_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- **Replace `<password>`** with the password you copied!
- **Keep this safe!** You'll need it soon.

✅ **Database ready!**

---

## 🖥️ **STEP 3: Deploy Backend to Render (3 min)**

### **1. Go to Render:**

- Visit: [render.com](https://render.com)
- Click **"Get Started for Free"**
- Sign up with **GitHub**

### **2. Create Web Service:**

- Click **"New +"** (top right)
- Click **"Web Service"**
- Click **"Connect GitHub"**
- Find and select **`aura-streaming`** repo
- Click **"Connect"**

### **3. Configure Backend:**

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `aura-backend` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | `Free` |

### **4. Add Environment Variables:**

Click **"Advanced"** → **"Add Environment Variable"**

Add these (click "+ Add Environment Variable" for each):

```
NODE_ENV=production
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
JWT_SECRET=aura_super_secret_key_2024_change_this_to_random_string
CORS_ORIGIN=*
PUBLIC_IP=0.0.0.0
SERVER_HOST=0.0.0.0
RTMP_PORT=1935
HTTP_MEDIA_PORT=8888
```

**⚠️ IMPORTANT:** Replace `MONGODB_URI` with your actual connection string from Step 2!

### **5. Deploy!**

- Click **"Create Web Service"**
- Wait 5-10 minutes (Render is building your app)
- You'll see logs scrolling
- When done, you'll see: `✅ Your service is live`

### **6. Copy Your Backend URL:**

At the top, you'll see:
```
https://aura-backend-xxxx.onrender.com
```

**Copy this URL!** You need it for the frontend.

✅ **Backend is live!**

---

## 🎨 **STEP 4: Deploy Frontend to Render (2 min)**

### **1. Create Static Site:**

- Click **"New +"** → **"Static Site"**
- Connect **same GitHub repo** (`aura-streaming`)

### **2. Configure Frontend:**

| Setting | Value |
|---------|-------|
| **Name** | `aura-frontend` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

### **3. Add Environment Variables:**

Click **"Advanced"** → **"Add Environment Variable"**

```
REACT_APP_API_URL=https://aura-backend-xxxx.onrender.com
REACT_APP_SOCKET_URL=https://aura-backend-xxxx.onrender.com
REACT_APP_MEDIA_URL=https://aura-backend-xxxx.onrender.com
```

**⚠️ Replace** `aura-backend-xxxx.onrender.com` **with YOUR backend URL from Step 3!**

### **4. Deploy!**

- Click **"Create Static Site"**
- Wait 5-10 minutes
- You'll see: `✅ Site is live`

### **5. Get Your FREE Domain:**

You'll see:
```
https://aura-frontend-xxxx.onrender.com
```

**🎉 THIS IS YOUR FREE DOMAIN!**

✅ **Frontend is live!**

---

## 🎊 **YOU'RE LIVE! SHARE YOUR LINK!**

### **Your Free Domain:**

```
https://aura-frontend-xxxx.onrender.com
```

**Share this link with anyone!** They can:
- ✅ Register accounts
- ✅ Login
- ✅ Watch streams (if you're streaming)
- ✅ Chat in real-time
- ✅ Follow users
- ✅ Search
- ✅ Everything works!

---

## ⚠️ **IMPORTANT: About Sleeping**

**Free tier sleeps after 15 minutes of inactivity.**

**What this means:**
- If nobody visits for 15 minutes, it goes to sleep
- First visitor after sleep waits 30 seconds (site wakes up)
- Then it's fast for everyone
- After 15 min idle, sleeps again

**Not a problem for:**
- Testing
- Small audience
- Personal use
- Showing friends

**Upgrade to paid ($7/month) to:**
- Never sleep
- Always instant
- Better performance

---

## 🧪 **Test Your Site:**

1. **Visit your domain:**
   ```
   https://aura-frontend-xxxx.onrender.com
   ```

2. **Register a new account**

3. **Login**

4. **Test search** (type your username)

5. **Check if everything works!**

---

## 🎥 **About Streaming (RTMP):**

**⚠️ Free hosting doesn't support RTMP (port 1935)**

**Your options:**

1. **Keep RTMP local** (recommended for free)
   - RTMP server runs on your computer
   - Web interface is online
   - You stream from your computer
   - Others watch on your domain
   - Works great!

2. **Upgrade to paid hosting** ($7-15/month)
   - DigitalOcean Droplet
   - Full RTMP support
   - Professional setup

3. **Use streaming service** (advanced)
   - AWS IVS
   - Cloudflare Stream
   - Mux

**For now:** Keep RTMP local, web hosted = Best free option!

---

## 🔄 **Auto-Deploy (Bonus!)**

**Every time you push to GitHub, Render auto-deploys!**

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Render automatically deploys! ✨
```

No manual work needed!

---

## 📝 **Troubleshooting:**

### **Backend won't start:**

Check logs in Render dashboard:
- Verify MongoDB connection string is correct
- Check all environment variables are set
- Look for error messages

### **Frontend can't connect to backend:**

- Check `REACT_APP_API_URL` is correct
- Make sure it has `https://` not `http://`
- Verify backend is running (visit backend URL)

### **Database connection failed:**

- Check MongoDB Atlas IP whitelist has `0.0.0.0/0`
- Verify username/password in connection string
- Make sure you replaced `<password>` with actual password

### **Site is slow:**

- First request after sleep takes 30 seconds (normal)
- After wake up, it's fast
- Upgrade to paid plan for always-on

---

## 💰 **Pricing:**

**FREE FOREVER:**
- ✅ 750 hours/month
- ✅ Free domain (.onrender.com)
- ✅ Free HTTPS
- ✅ 512MB RAM
- ⚠️ Sleeps after 15min

**PAID ($7/month per service):**
- ✅ Never sleeps
- ✅ Always on
- ✅ 512MB RAM
- ✅ Better performance

---

## 🌟 **Custom Domain (Optional):**

**Want your own domain?** (e.g., `aura.com`)

1. Buy domain from:
   - Namecheap ($10/year)
   - Google Domains
   - Cloudflare

2. In Render dashboard:
   - Click your service
   - Settings → Custom Domains
   - Add your domain
   - Update DNS settings

**Custom domain works on FREE plan!** 🎉

---

## ✅ **CHECKLIST:**

After deployment, verify:

- [ ] Frontend loads at your .onrender.com URL
- [ ] Can register new user
- [ ] Can login
- [ ] Chat works
- [ ] Search works
- [ ] Profile pages work
- [ ] Follow system works
- [ ] HTTPS (padlock icon) is working

---

## 🎊 **CONGRATULATIONS!**

Your AURA streaming platform is now:
- ✅ **Live on the internet**
- ✅ **Accessible worldwide**
- ✅ **FREE domain**
- ✅ **FREE HTTPS**
- ✅ **Auto-deploying from GitHub**

**Share your link with the world!** 🌍

---

## 📞 **Need Help?**

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://www.mongodb.com/docs/atlas/
- **GitHub Help:** https://docs.github.com

**You're now live! Welcome to the internet! 🚀**

