import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './HLSPlayer.css';

const HLSPlayer = ({ streamUrl, className = '', poster = '' }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) {
      console.log('⏸️ No stream URL or video element');
      return;
    }

    const video = videoRef.current;
    console.log('🎥 Initializing HLS player for:', streamUrl);

    // Check if HLS is supported
    if (Hls.isSupported()) {
      console.log('✅ HLS.js is supported');
      
      // Create new HLS instance with ULTRA OPTIMIZED settings
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        
        // AGGRESSIVE BUFFERING - NO MORE PAUSING!
        backBufferLength: 0, // Clear old segments immediately
        maxBufferLength: 10, // Only buffer 10 seconds ahead
        maxMaxBufferLength: 15, // Max 15 seconds
        maxBufferSize: 30 * 1000 * 1000, // 30MB max
        maxBufferHole: 0.1, // Fill small gaps quickly
        
        // FAST LOADING
        highBufferWatchdogPeriod: 1, // Check buffer every 1 second
        nudgeOffset: 0.05, // Small nudges for smooth playback
        nudgeMaxRetry: 10, // Try harder to fix issues
        maxFragLookUpTolerance: 0.1, // Find fragments faster
        
        // LIVE STREAMING OPTIMIZATION
        liveSyncDurationCount: 2, // Stay closer to live edge
        liveMaxLatencyDurationCount: 4, // Max 4 segments behind
        liveDurationInfinity: true, // Allow infinite live streams
        liveBackBufferLength: 0, // Don't keep old live data
        maxLiveSyncPlaybackRate: 2.0, // Speed up to catch up
        
        // INSTANT START
        testBandwidth: false, // Don't test, just start!
        progressive: true,
        startLevel: 0, // Start with lowest quality for instant playback
        autoStartLoad: true,
        capLevelToPlayerSize: false, // Don't limit based on player size
        
        // AGGRESSIVE RETRIES
        manifestLoadingTimeOut: 5000, // 5 seconds
        manifestLoadingMaxRetry: 10, // Try 10 times
        manifestLoadingRetryDelay: 500, // Retry faster (0.5s)
        levelLoadingTimeOut: 5000,
        levelLoadingMaxRetry: 10,
        levelLoadingRetryDelay: 500,
        fragLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 20, // Try VERY hard
        fragLoadingRetryDelay: 300, // Retry super fast (0.3s)
        
        // SMOOTH PLAYBACK
        abrEwmaDefaultEstimate: 500000, // Assume 500kbps for start
        abrBandWidthFactor: 0.8, // Use 80% of bandwidth
        abrBandWidthUpFactor: 0.7, // Conservative upgrade
        abrMaxWithRealBitrate: true,
        maxStarvationDelay: 2, // Wait max 2 seconds before starvation recovery
        maxLoadingDelay: 2, // Max 2 seconds delay
        minAutoBitrate: 0 // Allow any bitrate
      });

      hlsRef.current = hls;

      // Attach media
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      // Event handlers
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('📋 HLS Manifest parsed - PLAYING NOW!');
        video.play().catch(err => {
          console.warn('⚠️ Autoplay prevented, trying again...', err.message);
          // Try again after a short delay
          setTimeout(() => video.play().catch(() => {}), 100);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('❌ FATAL HLS Error:', data.type, data.details);
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error - RECOVERING IMMEDIATELY');
              // Immediate recovery
              setTimeout(() => {
                hls.startLoad();
                video.play().catch(() => {});
              }, 100);
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error - RECOVERING IMMEDIATELY');
              // Try to recover
              hls.recoverMediaError();
              setTimeout(() => {
                video.play().catch(() => {});
              }, 100);
              break;
              
            default:
              console.error('💀 Fatal error - RESTARTING STREAM');
              // Restart the entire stream
              hls.destroy();
              setTimeout(() => {
                const newHls = new Hls();
                newHls.loadSource(streamUrl);
                newHls.attachMedia(video);
                newHls.on(Hls.Events.MANIFEST_PARSED, () => {
                  video.play().catch(() => {});
                });
              }, 500);
              break;
          }
        } else {
          // Non-fatal error - just log it
          console.warn('⚠️ Non-fatal HLS warning:', data.details);
        }
      });

      // Auto-resume on buffer stall
      hls.on(Hls.Events.BUFFER_STALLED, () => {
        console.log('⚠️ Buffer stalled - forcing playback resume');
        video.play().catch(() => {});
      });

      // Log when buffering
      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        console.log('📦 Buffering data...');
      });

      // Celebrate successful fragment loads
      let fragCount = 0;
      hls.on(Hls.Events.FRAG_LOADED, () => {
        fragCount++;
        if (fragCount % 10 === 0) {
          console.log(`✅ Loaded ${fragCount} fragments - stream is smooth!`);
        }
      });

      // Log quality changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log(`🎬 Quality: Level ${data.level}`);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('✅ Native HLS support (Safari)');
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        console.log('📋 Native HLS loaded');
        video.play().catch(err => {
          console.warn('⚠️ Autoplay prevented:', err.message);
        });
      });
    } else {
      console.error('❌ HLS is not supported in this browser');
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up HLS player');
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <div className={`hls-player-container ${className}`}>
      <video
        ref={videoRef}
        className="hls-video"
        controls
        autoPlay
        muted={false}
        playsInline
        poster={poster}
      />
    </div>
  );
};

export default HLSPlayer;

