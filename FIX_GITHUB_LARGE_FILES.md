# Fix "Files Too Large" Error on GitHub

## Problem
The `server/ffmpeg.exe` file is over 100MB and cannot be pushed to GitHub.

## Solution

### Option 1: Click "Commit anyway" (Recommended)
If this is your first time seeing this error:
1. Click **"Commit anyway"** in GitHub Desktop
2. The commit will be made but the large file won't be uploaded
3. This is fine because:
   - `ffmpeg.exe` is already in `.gitignore`
   - Render doesn't need this file (it has its own ffmpeg)
   - The file stays on your local machine

### Option 2: Remove from Git Tracking (If needed)
If the error persists:

**In GitHub Desktop:**
1. Right-click on `server/ffmpeg.exe` in the changes list
2. Select **"Discard changes"** or **"Ignore file"**
3. Commit the remaining changes

**OR use Command Line:**
```bash
git rm --cached server/ffmpeg.exe
git commit -m "Remove ffmpeg from Git tracking"
```

The file will remain on your computer but won't be tracked by Git.

## Why This Happens
- `ffmpeg.exe` is a large executable file (~100MB+)
- GitHub has a 100MB file size limit
- We use it locally for stream processing
- Render deployment doesn't need it (uses system ffmpeg)

## What to Do Now
1. **Click "Commit anyway"** in the dialog
2. Your other changes (image upload, badges, etc.) will be committed
3. Push to GitHub
4. Deploy will work perfectly!

The `ffmpeg.exe` file is already listed in `.gitignore`, so this won't happen with future commits.

