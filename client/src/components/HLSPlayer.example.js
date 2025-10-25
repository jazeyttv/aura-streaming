// ==========================================
// EXAMPLE: How to use HLSPlayer component
// ==========================================

import React from 'react';
import HLSPlayer from './HLSPlayer';

// Example 1: Basic usage
const BasicExample = () => {
  const streamUrl = 'https://aura-streaming.onrender.com/api/hls-proxy/live/sk_abc123/index.m3u8';
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <HLSPlayer streamUrl={streamUrl} />
    </div>
  );
};

// Example 2: With custom styling
const StyledExample = () => {
  const streamUrl = 'https://aura-streaming.onrender.com/api/hls-proxy/live/sk_abc123/index.m3u8';
  
  return (
    <div style={{ width: '800px', height: '450px', margin: '20px auto' }}>
      <HLSPlayer 
        streamUrl={streamUrl}
        className="my-custom-player"
        poster="https://i.ibb.co/5F2vGJT/aura-logo.png"
      />
    </div>
  );
};

// Example 3: Integration in StreamView.js
const StreamViewExample = ({ stream }) => {
  // Construct the HLS URL
  const hlsUrl = stream.streamUrl 
    ? stream.streamUrl.replace('http://', 'https://aura-streaming.onrender.com/api/hls-proxy/')
    : null;

  return (
    <div className="stream-view-page">
      <div className="video-container">
        {hlsUrl ? (
          <HLSPlayer 
            streamUrl={hlsUrl}
            className="stream-video"
          />
        ) : (
          <div className="no-stream">Stream is offline</div>
        )}
      </div>
    </div>
  );
};

// Example 4: With conditional rendering
const ConditionalExample = ({ stream, isLive }) => {
  const hlsUrl = isLive && stream?.streamUrl
    ? `https://aura-streaming.onrender.com/api/hls-proxy/live/${stream.streamKey}/index.m3u8`
    : null;

  return (
    <div className="player-wrapper">
      {hlsUrl ? (
        <HLSPlayer streamUrl={hlsUrl} />
      ) : (
        <div className="offline-message">
          <h3>Stream is offline</h3>
          <p>Check back later!</p>
        </div>
      )}
    </div>
  );
};

// Example 5: Full StreamView.js integration replacement
const FullIntegration = () => {
  // Inside your StreamView.js component, replace the <video> tag:
  
  // OLD:
  /*
  <video 
    ref={videoRef}
    controls
    autoPlay
    muted={false}
    playsInline 
    className="stream-video"
  />
  */

  // NEW:
  /*
  <HLSPlayer 
    streamUrl={stream.streamUrl}
    className="stream-video"
  />
  */

  // That's it! The HLSPlayer component handles everything:
  // ✅ HLS.js initialization
  // ✅ Browser compatibility
  // ✅ Auto quality switching
  // ✅ Error recovery
  // ✅ Cleanup on unmount
  
  return null; // This is just documentation
};

export { BasicExample, StyledExample, StreamViewExample, ConditionalExample, FullIntegration };

