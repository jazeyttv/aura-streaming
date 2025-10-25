import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Video } from 'lucide-react';
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
          <p className="stream-card-streamer">{stream.streamerUsername}</p>
          <p className="stream-card-category">{stream.category}</p>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;

