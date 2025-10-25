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
                <Crown 
                  className="stream-card-badge admin" 
                  size={14}
                  color="#ff4444"
                  title="Administrator"
                />
              )}
              {stream.streamer?.role === 'moderator' && (
                <Shield 
                  className="stream-card-badge mod" 
                  size={14}
                  color="#4444ff"
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

