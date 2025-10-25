const NodeMediaServer = require('node-media-server');
const axios = require('axios');
const os = require('os');
const dotenv = require('dotenv');

// Load config.env file
dotenv.config({ path: './config.env' });

// Get network interfaces
function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

const RTMP_PORT = parseInt(process.env.RTMP_PORT) || 1935;
const HTTP_PORT = parseInt(process.env.HTTP_MEDIA_PORT) || 8888;
const API_SERVER = process.env.API_SERVER || 'http://localhost:5000';

const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: HTTP_PORT,
    mediaroot: './media',
    allow_origin: '*',
    api: true
  },
  trans: {
    ffmpeg: './ffmpeg.exe',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false,
        dash: false,
        // Explicitly enable audio transcoding
        mp4: false,
        mp4Flags: '[movflags=frag_keyframe+empty_moov]',
        // Audio codec settings
        ac: 'aac',
        acParam: ['-b:a', '128k', '-ar', '44100'],
        // Video codec settings
        vc: 'copy',
        vcParam: []
      }
    ]
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'admin'
  }
};

const nms = new NodeMediaServer(config);

// Store active streams
const activeStreamKeys = new Map();

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[RTMP] Publish request:', StreamPath);
  
  // Extract stream key from path: /live/STREAM_KEY
  const streamKey = StreamPath.split('/')[2];
  
  if (!streamKey) {
    console.log('[RTMP] No stream key provided');
    let session = nms.getSession(id);
    session.reject();
    return;
  }

  // Verify stream key with main server (don't use async/await here)
  axios.post(`${API_SERVER}/api/streams/verify-key`, {
    streamKey: streamKey
  })
  .then(response => {
    if (response.data.valid) {
      console.log(`[RTMP] ✅ Stream key validated for: ${response.data.username}`);
      // Store BEFORE the stream starts
      activeStreamKeys.set(streamKey, {
        username: response.data.username,
        userId: response.data.userId,
        startTime: Date.now(),
        sessionId: id
      });
      console.log('[RTMP] 💾 Stored stream info in activeStreamKeys');
    } else {
      console.log('[RTMP] ❌ Invalid stream key');
      let session = nms.getSession(id);
      session.reject();
    }
  })
  .catch(error => {
    console.error('[RTMP] Error verifying stream key:', error.message);
    let session = nms.getSession(id);
    session.reject();
  });
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[RTMP] 🔴 Stream started:', StreamPath);
  const streamKey = StreamPath.split('/')[2];
  
  // Wait for key validation to complete (race condition fix)
  const notifyBackend = (attempts = 0) => {
    if (activeStreamKeys.has(streamKey)) {
      const streamInfo = activeStreamKeys.get(streamKey);
      console.log('[RTMP] 📡 Notifying backend API:', `${API_SERVER}/api/streams/notify-live`);
      console.log('[RTMP] 📦 Payload:', { streamKey, userId: streamInfo.userId });
      
      // Notify main server that stream is live
      axios.post(`${API_SERVER}/api/streams/notify-live`, {
        streamKey: streamKey,
        userId: streamInfo.userId
      })
      .then(response => {
        console.log('[RTMP] ✅ Backend notified successfully:', response.data);
      })
      .catch(err => {
        console.error('[RTMP] ❌ Error notifying main server:', err.message);
        if (err.response) {
          console.error('[RTMP] Response status:', err.response.status);
          console.error('[RTMP] Response data:', err.response.data);
        }
      });
    } else if (attempts < 10) {
      // Wait 100ms and retry (max 1 second)
      console.log(`[RTMP] ⏳ Waiting for stream key validation... (attempt ${attempts + 1}/10)`);
      setTimeout(() => notifyBackend(attempts + 1), 100);
    } else {
      console.log('[RTMP] ❌ Stream key not found after 1 second - validation may have failed');
    }
  };
  
  // Start notification process
  notifyBackend();
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[RTMP] ⚫ Stream ended:', StreamPath);
  const streamKey = StreamPath.split('/')[2];
  
  if (activeStreamKeys.has(streamKey)) {
    const streamInfo = activeStreamKeys.get(streamKey);
    console.log('[RTMP] 📡 Notifying backend that stream ended:', `${API_SERVER}/api/streams/notify-ended`);
    
    // Notify main server that stream ended
    axios.post(`${API_SERVER}/api/streams/notify-ended`, {
      streamKey: streamKey,
      userId: streamInfo.userId
    })
    .then(response => {
      console.log('[RTMP] ✅ Backend notified of stream end:', response.data);
    })
    .catch(err => {
      console.error('[RTMP] ❌ Error notifying main server:', err.message);
    });
    
    activeStreamKeys.delete(streamKey);
  } else {
    console.log('[RTMP] ⚠️ Stream key not found in activeStreamKeys on end');
  }
});

nms.run();

const addresses = getNetworkAddresses();

console.log('');
console.log('🎥 ========================================');
  console.log('   AURA RTMP MEDIA SERVER - LIVE');
console.log('========================================');
console.log('');
console.log('📡 RTMP ENDPOINTS:');
console.log(`   Local:    rtmp://localhost:${RTMP_PORT}/live`);
console.log(`   Local IP: rtmp://127.0.0.1:${RTMP_PORT}/live`);

addresses.forEach(addr => {
  console.log(`   Network:  rtmp://${addr}:${RTMP_PORT}/live`);
});

console.log('');
console.log('🌐 HLS PLAYBACK:');
console.log(`   Local:    http://localhost:${HTTP_PORT}/live/{STREAM_KEY}/index.m3u8`);
console.log(`   Note: Port changed to ${HTTP_PORT} (port 8000 was in use)`);

addresses.forEach(addr => {
  console.log(`   Network:  http://${addr}:${HTTP_PORT}/live/{STREAM_KEY}/index.m3u8`);
});

console.log('');
console.log('📺 OBS STUDIO SETTINGS:');
console.log('   1. Settings → Stream');
console.log('   2. Service: Custom');
console.log(`   3. Server: rtmp://YOUR_IP:${RTMP_PORT}/live`);
console.log('   4. Stream Key: (your stream key from dashboard)');
console.log('');
console.log('🌍 STREAMING FROM INTERNET:');
console.log('   Make sure to:');
console.log(`   - Forward port ${RTMP_PORT} (RTMP) in your router`);
console.log(`   - Forward port ${HTTP_PORT} (HLS) in your router`);
console.log('   - Use your public IP address');
console.log('');
console.log('⚠️  IMPORTANT: Update client/.env with new media port:');
console.log(`   REACT_APP_MEDIA_URL=http://localhost:${HTTP_PORT}`);
console.log('');
console.log('========================================');
console.log('');
