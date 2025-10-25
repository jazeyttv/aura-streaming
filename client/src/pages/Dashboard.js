import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  Video, Monitor, Eye, Settings as SettingsIcon, Key, Copy, RefreshCw, 
  ExternalLink, Users, Clock, Filter, MoreVertical, Zap, MessageSquare,
  Shield, Ban, SlashIcon, UserX, Activity
} from 'lucide-react';
import { SOCKET_URL } from '../config';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState(null);
  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'Just Chatting'
  });
  const [viewerCount, setViewerCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState(null);
  const [message, setMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  
  const socketRef = React.useRef(null);
  const timerRef = React.useRef(null);

  useEffect(() => {
    // Check if user has streaming access
    if (!user) {
      return;
    }

    if (!user.isStreamer) {
      alert('⛔ You do not have streaming access. Please contact an administrator.');
      navigate('/');
      return;
    }

    fetchActiveStream();
    fetchFollowerCount();
    fetchRecentActivity();

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchActiveStream();
      fetchFollowerCount();
    }, 5000);

    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('stream-started', ({ streamId, username }) => {
      console.log('[DASHBOARD] Stream started event:', { streamId, username });
      if (username === user.username) {
        fetchActiveStream();
      }
    });

    socketRef.current.on('stream-ended', ({ streamId }) => {
      console.log('[DASHBOARD] Stream ended event:', streamId);
      if (activeStream && (activeStream.id === streamId || activeStream._id === streamId)) {
        setActiveStream(null);
        setViewerCount(0);
        setStreamStartTime(null);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    });

    socketRef.current.on('viewer-count', (count) => {
      console.log('[DASHBOARD] Viewer count update:', count);
      setViewerCount(count);
    });

    // Listen for new followers
    socketRef.current.on('new-follower', (data) => {
      console.log('[DASHBOARD] New follower:', data);
      const newActivity = {
        id: Date.now(),
        type: 'follow',
        username: data.followerUsername,
        timestamp: new Date(),
        message: `${data.followerUsername} followed you!`
      };
      setRecentActivity(prev => [newActivity, ...prev].slice(0, 10)); // Keep last 10
      setFollowerCount(prev => prev + 1);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [user, navigate]);

  // Monitor viewer count when stream is active
  useEffect(() => {
    if (activeStream && socketRef.current) {
      // Socket already listening from main useEffect
      console.log('[DASHBOARD] Monitoring viewer count for stream');
    }
  }, [activeStream]);

  // Timer for session time
  useEffect(() => {
    if (streamStartTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - streamStartTime) / 1000);
        const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        setSessionTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      setSessionTime('00:00:00');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [streamStartTime]);

  const fetchActiveStream = async () => {
    try {
      const response = await axios.get('/api/streams/user/active');
      console.log('[DASHBOARD] Fetched active stream:', response.data);
      if (response.data.stream) {
        const stream = response.data.stream;
        setActiveStream(stream);
        setStreamSettings({
          title: stream.title || '',
          description: stream.description || '',
          category: stream.category || 'Just Chatting'
        });
        setViewerCount(stream.viewerCount || 0);
        if (stream.startedAt) {
          setStreamStartTime(new Date(stream.startedAt));
        }
      } else {
        // No active stream
        if (activeStream) {
          setActiveStream(null);
          setViewerCount(0);
          setStreamStartTime(null);
        }
        
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('streamSettings');
        if (savedSettings) {
          try {
            setStreamSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.error('Failed to parse saved settings:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching active stream:', error);
    }
  };

  const fetchFollowerCount = async () => {
    try {
      const response = await axios.get(`/api/users/${user.username}`);
      setFollowerCount(response.data.followers?.length || 0);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent followers (last 10)
      const response = await axios.get(`/api/users/${user.username}`);
      if (response.data.followers && response.data.followers.length > 0) {
        // Get follower details
        const recentFollowerIds = response.data.followers.slice(-10).reverse();
        const activities = [];
        
        for (const followerId of recentFollowerIds) {
          try {
            const followerResponse = await axios.get(`/api/users/${followerId}`);
            if (followerResponse.data) {
              activities.push({
                id: `${followerId}-${Date.now()}`,
                type: 'follow',
                username: followerResponse.data.username,
                timestamp: new Date(),
                message: `${followerResponse.data.username} followed you!`
              });
            }
          } catch (err) {
            console.error('Error fetching follower details:', err);
          }
        }
        
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleUpdateStream = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setMessage('');
    
    try {
      if (activeStream && activeStream.isLive) {
        // Update existing live stream
        await axios.put(`/api/streams/${activeStream.id || activeStream._id}`, streamSettings);
        setMessage('✅ Stream updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        fetchActiveStream();
      } else {
        // Save settings to localStorage for when you go live
        localStorage.setItem('streamSettings', JSON.stringify(streamSettings));
        console.log('[DASHBOARD] Stream settings saved for next stream:', streamSettings);
        setMessage('✅ Settings saved! They will apply when you go live.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating stream:', error);
      setMessage('❌ Failed to update stream');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('⚠️ Are you sure? Your current stream key will stop working!')) {
      return;
    }

    try {
      const response = await axios.post('/api/streams/regenerate-key');
      alert('✅ Stream key regenerated! Please update OBS with your new key.');
      window.location.reload();
    } catch (error) {
      console.error('Error regenerating key:', error);
      alert('❌ Failed to regenerate stream key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const openStreamInNewTab = () => {
    if (activeStream) {
      window.open(`/stream/${activeStream.id || activeStream._id}`, '_blank');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!user || !user.isStreamer) {
    return null;
  }

  const isLive = activeStream?.isLive;

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-section">
          <h3>Stream</h3>
          <button className="sidebar-btn active">
            <Video size={18} />
            <span>Stream Manager</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <h3>Studio</h3>
          <button className="sidebar-btn">
            <Activity size={18} />
            <span>Dashboard</span>
          </button>
          <button className="sidebar-btn" onClick={() => navigate('/settings')}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar-section">
          <h3>Channel</h3>
          <button className="sidebar-btn" onClick={() => navigate(`/profile/${user.username}`)}>
            <Monitor size={18} />
            <span>My Channel</span>
          </button>
          <button className="sidebar-btn" onClick={() => navigate('/channel-actions')}>
            <Zap size={18} />
            <span>Channel Actions</span>
          </button>
          {user.role === 'admin' && (
            <button className="sidebar-btn" onClick={() => navigate('/admin')}>
              <Shield size={18} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Stream Manager</h1>
            <div className="stream-status">
              <div className={`status-indicator ${isLive ? 'live' : 'offline'}`}></div>
              <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`dashboard-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Session Info Panel */}
          <div className="session-info-panel">
            <div className="info-card">
              <div className="info-label">Session</div>
              <div className="info-value">{isLive ? 'ONLINE' : 'OFFLINE'}</div>
            </div>
            <div className="info-divider"></div>
            <div className="info-card">
              <div className="info-label">Viewers</div>
              <div className="info-value">{viewerCount}</div>
            </div>
            <div className="info-divider"></div>
            <div className="info-card">
              <div className="info-label">Followers</div>
              <div className="info-value">{followerCount}</div>
            </div>
            <div className="info-divider"></div>
            <div className="info-card">
              <div className="info-label">Time Live</div>
              <div className="info-value">{sessionTime}</div>
            </div>
          </div>

          {/* Stream Preview */}
          <div className="stream-preview-panel">
            <div className="panel-header">
              <Monitor size={18} />
              <span>Stream Preview</span>
              {isLive && (
                <button className="btn-icon" onClick={openStreamInNewTab} title="Open in new tab">
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
            <div className="stream-preview-container">
              {isLive ? (
                <div className="preview-live">
                  <iframe
                    className="preview-video"
                    src={`/stream/${activeStream.id || activeStream._id}?embed=true`}
                    frameBorder="0"
                    allowFullScreen
                    title="Stream Preview"
                  />
                  <div className="preview-overlay">
                    <div className="preview-badge live">LIVE</div>
                  </div>
                </div>
              ) : (
                <div className="preview-offline">
                  <div className="offline-icon">
                    <Video size={64} />
                  </div>
                  <div className="offline-badge">OFFLINE</div>
                  <p className="offline-text">{user.username} is offline</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="activity-feed-panel">
            <div className="panel-header">
              <Activity size={18} />
              <span>Activity Feed</span>
            </div>
            <div className="activity-feed-content">
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon follow-icon">
                        <Users size={14} />
                      </div>
                      <div className="activity-details">
                        <span className="activity-username">{activity.username}</span>
                        <span className="activity-message">followed you!</span>
                      </div>
                      <div className="activity-time">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="activity-placeholder">
                  <Activity size={32} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Mod Actions */}
          <div className="mod-actions-panel">
            <div className="panel-header">
              <Shield size={18} />
              <span>Mod Actions</span>
              <button className="btn-icon">
                <Filter size={16} />
              </button>
            </div>
            <div className="mod-actions-content">
              <div className="mod-placeholder">
                <Shield size={32} />
                <p>No recent mod actions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Actions Sidebar */}
      <div className="dashboard-right-sidebar">
        <div className="actions-panel">
          <div className="panel-header">
            <Zap size={18} />
            <span>Channel Actions</span>
          </div>
          
          <div className="action-group">
            <h4>Stream Settings</h4>
            <form onSubmit={handleUpdateStream}>
              <div className="form-group-compact">
                <label>Stream Title</label>
                <input
                  type="text"
                  value={streamSettings.title}
                  onChange={(e) => setStreamSettings({ ...streamSettings, title: e.target.value })}
                  placeholder="What are you streaming?"
                  maxLength={100}
                />
              </div>

              <div className="form-group-compact">
                <label>Category</label>
                <select
                  value={streamSettings.category}
                  onChange={(e) => setStreamSettings({ ...streamSettings, category: e.target.value })}
                >
                  <option>Just Chatting</option>
                  <option>Gaming</option>
                  <option>Music</option>
                  <option>Creative</option>
                  <option>Sports</option>
                  <option>Other</option>
                </select>
              </div>

              <button type="submit" className="btn-action" disabled={loading}>
                <SettingsIcon size={16} />
                {loading ? 'Saving...' : isLive ? 'Update Stream' : 'Save Settings'}
              </button>
            </form>
          </div>

          <div className="action-group">
            <h4>Streaming Setup</h4>
            <div className="setup-item">
              <label>RTMP URL</label>
              <div className="input-with-copy">
                <input type="text" value={user.rtmpUrl} readOnly />
                <button onClick={() => copyToClipboard(user.rtmpUrl)} className="btn-copy">
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="setup-item">
              <label>Stream Key</label>
              <div className="input-with-copy">
                <input 
                  type={showStreamKey ? 'text' : 'password'} 
                  value={user.streamKey} 
                  readOnly 
                />
                <button onClick={() => setShowStreamKey(!showStreamKey)} className="btn-copy">
                  <Eye size={14} />
                </button>
                <button onClick={() => copyToClipboard(user.streamKey)} className="btn-copy">
                  <Copy size={14} />
                </button>
              </div>
              {copySuccess && <small className="success-text">✓ Copied!</small>}
            </div>

            <button onClick={handleRegenerateKey} className="btn-action-secondary">
              <RefreshCw size={16} />
              Regenerate Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
