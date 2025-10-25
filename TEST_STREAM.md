# 🔍 Stream Not Showing - Debug Steps

## Step 1: Check Main Backend Terminal

Look at your main app terminal (where START_ALL.bat is running).

**When you start streaming in OBS, you should see:**
```
Stream key validated for: Jazey
Stream is now live
```

**Do you see these messages?**
- ✅ YES - Go to Step 2
- ❌ NO - The RTMP server isn't talking to backend

---

## Step 2: Manual Test - Create Stream

Let's manually create a stream to test if the website works:

### Open Your Browser Console

1. Go to http://localhost:3000
2. Press `F12` (opens Developer Tools)
3. Click "Console" tab
4. Paste this code:

```javascript
// Test if backend is reachable
fetch('http://localhost:5000/api/streams/live')
  .then(r => r.json())
  .then(data => console.log('Live streams:', data))
  .catch(err => console.error('Error:', err));
```

**What does it show?**
- Empty array `[]` = Backend working, but no streams
- Error = Backend not reachable

---

## Step 3: Check MongoDB

**Are you using MongoDB?**
- YES - Stream data goes to database
- NO - Stream data is in-memory only

**To check:**
Look at your main terminal when server starts:
- ✅ MongoDB connected successfully = Using MongoDB
- ⚠️ MongoDB connection failed = Using in-memory

---

## Step 4: Test Stream Creation Manually

While streaming in OBS, open a new PowerShell and run:

```powershell
curl -X POST http://localhost:5000/api/streams/notify-live -H "Content-Type: application/json" -d "{\"streamKey\": \"sk_be5a7a059724478ca0048cd9c59c4c52\", \"userId\": \"your_user_id\"}"
```

Replace `your_user_id` with your actual user ID.

---

## Quick Fix: Restart Everything

Sometimes the simplest fix works:

1. **Stop streaming in OBS**
2. **Stop RTMP server** (Ctrl+C)
3. **Stop main app** (Ctrl+C)
4. **Start main app:** `START_ALL.bat`
5. **Start RTMP server:** `START_RTMP.bat`
6. **Login to website**
7. **Go to Dashboard**
8. **Start streaming in OBS**
9. **Refresh homepage** (F5)

---

## Common Issues:

### Issue 1: User Not Found
**Problem:** Backend can't find user with that stream key
**Fix:** Login to website first, then stream

### Issue 2: Stream Not Created
**Problem:** notify-live endpoint not being called
**Fix:** Check RTMP server can reach backend (port 5000)

### Issue 3: Frontend Not Updating
**Problem:** Frontend not fetching streams
**Fix:** Check browser console for errors (F12)

---

## What to Check:

1. ✅ RTMP server running (port 1935)
2. ✅ Backend running (port 5000)
3. ✅ Frontend running (port 3000)
4. ✅ Logged into website
5. ✅ Stream key matches dashboard
6. ✅ OBS shows "Streaming" (green)
7. ❓ Stream shows on homepage?

---

## Next Steps:

Tell me:
1. Do you see messages in the main backend terminal when streaming?
2. What does the browser console show? (F12)
3. Are you using MongoDB or in-memory storage?

