# 🔧 Required Render Environment Variables

## Backend Service (`aura-streaming.onrender.com`)

Add these environment variables to your Render backend service:

```
CORS_ORIGIN=https://aura-streaming-1.onrender.com,https://aura-streaming.onrender.com
MEDIA_URL=https://aura-streaming.onrender.com
NODE_ENV=production
```

## Frontend Service (`aura-streaming-1.onrender.com`)

Add these environment variables to your Render frontend (static site):

```
REACT_APP_API_URL=https://aura-streaming.onrender.com
REACT_APP_SOCKET_URL=https://aura-streaming.onrender.com
REACT_APP_MEDIA_URL=https://aura-streaming.onrender.com/api/hls-proxy
```

## After Adding Variables:

1. **Manually redeploy BOTH services** (backend first, then frontend)
2. **Stop your stream in OBS** (if streaming)
3. **Start streaming again** - This will generate a NEW stream URL with the correct domain

## Why This Fixes It:

- **CORS_ORIGIN**: Allows your frontend to access your backend
- **MEDIA_URL**: Makes stream URLs use `aura-streaming.onrender.com` instead of ngrok
- **REACT_APP_***: Frontend knows where to find backend and media

---

**Note**: After redeploying, any OLD streams with ngrok URLs will be cleared when you start a new stream.

