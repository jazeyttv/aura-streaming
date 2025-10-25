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
      
      // Create new HLS instance
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        liveDurationInfinity: false,
        liveBackBufferLength: 0,
        maxLiveSyncPlaybackRate: 1.5,
        testBandwidth: true,
        progressive: true,
        startLevel: -1, // Auto quality
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 1000,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000
      });

      hlsRef.current = hls;

      // Attach media
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      // Event handlers
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('📋 HLS Manifest parsed successfully');
        video.play().catch(err => {
          console.warn('⚠️ Autoplay prevented:', err.message);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS Error:', data.type, data.details);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('💀 Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        console.log('📦 Fragment loaded');
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log(`🔄 Quality switched to level ${data.level}`);
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

