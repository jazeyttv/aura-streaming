const express = require('express');
const router = express.Router();
const axios = require('axios');

// HLS source server (your home computer)
const HLS_SOURCE = process.env.HLS_SOURCE || 'http://72.23.212.188:8888';

// @route   GET /api/hls-proxy/live/:streamKey/*
// @desc    Proxy HLS streams from home server to HTTPS
// @access  Public
router.get('/live/:streamKey/*', async (req, res) => {
  const streamKey = req.params.streamKey;
  const filePath = req.params[0]; // Captures everything after streamKey
  const sourceUrl = `${HLS_SOURCE}/live/${streamKey}/${filePath}`;
  
  // Retry logic for .ts segments (3 attempts with 500ms delay)
  const maxRetries = filePath.endsWith('.ts') ? 3 : 1;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[HLS Proxy] Retry ${attempt}/${maxRetries}: ${sourceUrl}`);
      }

      // Fetch the file from your home server with longer timeout
      const response = await axios.get(sourceUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds (increased from 10s)
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 500
      });

      // If we got a 404, the segment doesn't exist yet - don't retry
      if (response.status === 404) {
        return res.status(404).json({ 
          error: 'Stream segment not found',
          message: 'The requested stream segment does not exist yet.'
        });
      }

      // Set appropriate headers
      const contentType = response.headers['content-type'];
      if (contentType) {
        res.set('Content-Type', contentType);
      }

      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

      // Cache headers for HLS
      if (filePath.endsWith('.m3u8')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.endsWith('.ts')) {
        res.set('Cache-Control', 'public, max-age=31536000');
      }

      // Send the file
      return res.send(response.data);

    } catch (error) {
      lastError = error;
      
      // If it's the last attempt or a non-retryable error, log and continue to error handling
      if (attempt === maxRetries || error.code === 'ECONNREFUSED' || error.response?.status === 404) {
        console.error(`[HLS Proxy] Error after ${attempt} attempts:`, error.message);
        break;
      }
    }
  }

  // Handle errors after all retries exhausted
  if (lastError.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      error: 'HLS server unavailable',
      message: 'The streaming server is not responding. Make sure your RTMP server is running.'
    });
  } else if (lastError.code === 'ECONNABORTED' || lastError.code === 'ETIMEDOUT') {
    return res.status(504).json({ 
      error: 'Stream timeout',
      message: 'The stream server took too long to respond.'
    });
  } else if (lastError.response?.status === 404) {
    return res.status(404).json({ 
      error: 'Stream not found',
      message: 'The requested stream segment does not exist.'
    });
  } else {
    return res.status(500).json({ 
      error: 'Proxy error',
      message: lastError.message 
    });
  }
});

// Handle OPTIONS for CORS preflight
router.options('/live/:streamKey/*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

module.exports = router;

