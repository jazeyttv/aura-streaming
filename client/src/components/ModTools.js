import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Clock, Ban, XCircle } from 'lucide-react';
import './ModTools.css';

const ModTools = ({ targetUser, channelName, onClose }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(600); // Default 10 minutes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTimeout = async () => {
    if (!targetUser || !channelName) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/chat-moderation/timeout', {
        userId: targetUser._id,
        username: targetUser.username,
        channelName,
        duration: parseInt(duration),
        reason: reason || 'No reason provided'
      });
      
      setMessage(`${targetUser.username} timed out for ${duration} seconds`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to timeout user');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!targetUser || !channelName) return;
    
    const confirmed = window.confirm(`Are you sure you want to ban ${targetUser.username} from chat?`);
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/chat-moderation/ban', {
        userId: targetUser._id,
        username: targetUser.username,
        channelName,
        reason: reason || 'No reason provided'
      });
      
      setMessage(`${targetUser.username} banned from chat`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to ban user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!targetUser || !channelName) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/chat-moderation/unban', {
        userId: targetUser._id,
        channelName
      });
      
      setMessage(`${targetUser.username} unbanned from chat`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to unban user');
    } finally {
      setLoading(false);
    }
  };

  if (!targetUser) return null;

  return (
    <div className="mod-tools-overlay" onClick={onClose}>
      <div className="mod-tools-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mod-tools-header">
          <Shield size={20} />
          <h3>Moderate: {targetUser.username}</h3>
          <button className="mod-tools-close" onClick={onClose}>
            <XCircle size={20} />
          </button>
        </div>

        {message && (
          <div className="mod-tools-message">
            {message}
          </div>
        )}

        <div className="mod-tools-content">
          <div className="mod-tools-field">
            <label>Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for action..."
              disabled={loading}
            />
          </div>

          <div className="mod-tools-actions">
            <div className="mod-action-group">
              <label>Timeout Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                disabled={loading}
              >
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
                <option value="1800">30 minutes</option>
                <option value="3600">1 hour</option>
                <option value="86400">24 hours</option>
              </select>
              <button
                className="mod-btn mod-btn-timeout"
                onClick={handleTimeout}
                disabled={loading}
              >
                <Clock size={16} />
                Timeout
              </button>
            </div>

            <div className="mod-action-group">
              <label>Permanent Actions</label>
              <button
                className="mod-btn mod-btn-ban"
                onClick={handleBan}
                disabled={loading}
              >
                <Ban size={16} />
                Ban from Chat
              </button>
              <button
                className="mod-btn mod-btn-unban"
                onClick={handleUnban}
                disabled={loading}
              >
                <Shield size={16} />
                Unban from Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModTools;

