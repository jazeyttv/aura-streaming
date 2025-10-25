const express = require('express');
const router = express.Router();
const axios = require('axios');

// HLS source server (your home computer)
const HLS_SOURCE = process.env.HLS_SOURCE || 'http://72.23.212.188:8888';

// @route   GET /api/hls-proxy/live/:streamKey/*
// @desc    Proxy HLS streams from home server to HTTPS
// @access  Public
router.get('/live/:streamKey/*', async (req, res) => {
  try {
    const streamKey = req.params.streamKey;
    const filePath = req.params[0]; // Captures everything after streamKey

    // Construct the full URL to your home HLS server
    const sourceUrl = `${HLS_SOURCE}/live/${streamKey}/${filePath}`;
    
    console.log(`[HLS Proxy] Fetching: ${sourceUrl}`);

    // Fetch the file from your home server
    const response = await axios.get(sourceUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });

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
    res.send(response.data);

  } catch (error) {
    console.error('[HLS Proxy] Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'HLS server unavailable',
        message: 'The streaming server is not responding. Make sure your RTMP server is running.'
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({ 
        error: 'Stream not found',
        message: 'The requested stream segment does not exist.'
      });
    } else {
      res.status(500).json({ 
        error: 'Proxy error',
        message: error.message 
      });
    }
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

