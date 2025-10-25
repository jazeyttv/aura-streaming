import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Video, CheckCircle, Shield, Crown } from 'lucide-react';
import './StreamCard.css';

const StreamCard = ({ stream }) => {
  const getStreamId = () => {
    return stream.id || stream._id;
  };

  return (
    <Link to={`/stream/${getStreamId()}`} className="stream-card">
      <div className="stream-thumbnail-wrapper">
        <div className="stream-thumbnail-content">
          <Video className="thumbnail-icon" />
        </div>
        
        {stream.isLive && (
          <div className="stream-live-badge">
            <span className="live-dot"></span>
            <span>LIVE</span>
          </div>
        )}
        
        <div className="stream-viewers-badge">
          <Eye size={14} />
          <span>{stream.viewerCount || 0}</span>
        </div>
      </div>
      
      <div className="stream-card-info">
        <div className="stream-card-avatar">
          {stream.streamerUsername?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="stream-card-details">
          <h3 className="stream-card-title">{stream.title}</h3>
          <div className="stream-card-streamer-row">
            <p className="stream-card-streamer">{stream.streamerUsername}</p>
            <div className="stream-card-badges">
              {stream.streamer?.isPartner && (
                <CheckCircle 
                  className="stream-card-badge partner" 
                  size={14} 
                  fill="#00d9ff"
                  color="#00d9ff"
                  title="Verified Partner"
                />
              )}
              {stream.streamer?.isAffiliate && (
                <span className="stream-card-badge affiliate" title="Affiliate">A</span>
              )}
              {stream.streamer?.role === 'admin' && (
                <svg
                  className="stream-card-badge admin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#00ffff"
                  title="Staff"
                >
                  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                </svg>
              )}
              {stream.streamer?.role === 'moderator' && (
                <Shield 
                  className="stream-card-badge mod"
                  size={14}
                  color="#00ffff"
                  title="Moderator"
                />
              )}
            </div>
          </div>
          <p className="stream-card-category">{stream.category}</p>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;

