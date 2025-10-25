# 👑 Admin Login Guide

## 🎯 Quick Access

### Admin Login Page
Go to: **http://localhost:3000/admin-login**

### Default Admin Credentials
```
Username: admin
Password: admin123
```

That's it! Just login and you're admin.

---

## 🚀 How to Use

### Step 1: Access Admin Login
1. Open browser
2. Go to: `http://localhost:3000/admin-login`
3. You'll see the Admin Login page

### Step 2: Login
1. Username: `admin`
2. Password: `admin123`
3. Click "Login as Admin"
4. You're automatically logged in with admin powers!

### Step 3: Access Admin Dashboard
After login, you'll be redirected to the Admin Dashboard where you can:
- View platform statistics
- Manage all users
- Change user roles
- Ban/unban users
- See who's online

---

## 🔑 How It Works

The system automatically creates an admin account with these credentials:
- **Username:** admin
- **Email:** admin@kicky.local
- **Role:** Admin (full access)
- **Streamer:** Yes (can stream too!)

The first time you login, it creates this account automatically in your database or memory.

---

## 👑 Admin Features

Once logged in as admin, you can:

### In Chat:
- 🔴 **Red username** - Everyone sees you're admin
- 👑 **ADMIN badge** - Shows next to your name
- 🗑️ **Delete messages** - Remove inappropriate messages
- 🚫 **Timeout users** - 5-minute temporary ban
- 🛡️ **Slow mode** - Limit message frequency

### In Admin Dashboard:
- 📊 **View stats** - Total users, streamers, live streams
- 👥 **Manage users** - See all registered users
- ⬆️ **Promote/demote** - Change anyone's role
- 🚫 **Ban permanently** - Remove bad actors
- ✅ **Unban** - Give second chances

---

## 🔄 Alternative Ways to Get Admin

### Option 1: Admin Login Page (Easiest)
Just use the admin-login page with default credentials.

### Option 2: First User Auto-Admin
The **first user** to register becomes admin automatically!
1. Make sure no users exist
2. Register normally at `/register`
3. You're admin!

### Option 3: Regular Login
If the admin account exists, you can also login at `/login` with:
- Username: `admin`
- Password: `admin123`

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Change Password in Production!

**For production use, change the default password:**

Edit `server/routes/auth.js` and change:
```javascript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'your_secure_password_here';
```

Or add to `server/.env`:
```env
ADMIN_USERNAME=myadmin
ADMIN_PASSWORD=super_secure_password_12345
```

### Best Practices:
1. ✅ Change default password immediately
2. ✅ Use strong passwords (12+ characters)
3. ✅ Don't share admin credentials
4. ✅ Create moderators instead of multiple admins
5. ✅ Log out when done

---

## 🎮 Quick Start Workflow

1. **Start your app:**
   ```
   START_ALL.bat
   ```

2. **Go to admin login:**
   ```
   http://localhost:3000/admin-login
   ```

3. **Login with:**
   - Username: `admin`
   - Password: `admin123`

4. **Access admin panel:**
   - Look for "Admin Panel" button in navbar
   - Or go directly to `/admin`

5. **Start managing:**
   - View statistics
   - Manage users
   - Moderate content

---

## 📱 Quick Links

| Page | URL |
|------|-----|
| Admin Login | http://localhost:3000/admin-login |
| Admin Dashboard | http://localhost:3000/admin |
| Regular Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Homepage | http://localhost:3000 |

---

## 🐛 Troubleshooting

### Can't login as admin?
- Check backend is running (port 5000)
- Try refreshing the page
- Check browser console for errors
- Make sure you typed credentials correctly

### Don't see Admin Panel button?
- You need to be logged in first
- Check your role is "admin" in database
- Try logging out and in again
- Clear browser cache (Ctrl+Shift+Del)

### Admin Dashboard shows error?
- Verify backend is running
- Check MongoDB is running (optional)
- Look for errors in browser console
- Check server terminal for errors

---

## 👥 Create More Admins

**From Admin Dashboard:**
1. Login as admin
2. Go to Admin Dashboard
3. Find the user
4. Change role to "Admin"
5. They now have admin access!

**Or register someone and promote them:**
1. They register normally
2. You login as admin
3. Find them in Admin Dashboard
4. Promote to Admin

---

## 🎉 You're All Set!

You now have full admin access to your streaming platform!

**What you can do:**
- ✅ Manage all users
- ✅ Moderate all chats
- ✅ View platform statistics
- ✅ Ban/unban users
- ✅ Promote moderators
- ✅ Stream yourself
- ✅ Full control!

---

**Default Credentials (Don't Forget!):**
```
URL: http://localhost:3000/admin-login
Username: admin
Password: admin123
```

**Happy Administrating! 👑**

