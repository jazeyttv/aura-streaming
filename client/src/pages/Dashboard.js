import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Video, Monitor, Eye, Settings, Key, Copy, RefreshCw, ExternalLink } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (!user?.isStreamer) {
      navigate('/');
      return;
    }

    fetchActiveStream();

    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('stream-started', ({ streamId, username }) => {
      console.log('[DASHBOARD] Stream started event:', { streamId, username });
      if (username === user.username) {
        fetchActiveStream();
      }
    });

    socketRef.current.on('stream-ended', ({ streamId }) => {
      console.log('[DASHBOARD] Stream ended event:', { streamId });
      if (activeStream && (activeStream.id === streamId || activeStream._id === streamId)) {
        setActiveStream(null);
      }
    });

    // Poll for stream status every 5 seconds
    const pollInterval = setInterval(() => {
      fetchActiveStream();
    }, 5000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearInterval(pollInterval);
    };
  }, [user, navigate]);

  useEffect(() => {
    if (activeStream && socketRef.current) {
      const streamId = activeStream.id || activeStream._id;
      
      socketRef.current.on('viewer-count', (count) => {
        setViewerCount(count);
      });
    }
  }, [activeStream]);

  const fetchActiveStream = async () => {
    try {
      const response = await axios.get('/api/streams/user/active');
      console.log('[DASHBOARD] Fetched active stream:', response.data);
      if (response.data.stream) {
        const stream = response.data.stream;
        setActiveStream(stream);
        setStreamSettings({
          title: stream.title,
          description: stream.description || '',
          category: stream.category
        });
        setViewerCount(stream.viewerCount || 0);
      } else {
        // No active stream
        if (activeStream) {
          setActiveStream(null);
        }
      }
    } catch (error) {
      console.error('Error fetching active stream:', error);
    }
  };

  const handleUpdateStream = async () => {
    if (!activeStream) return;

    setLoading(true);
    try {
      const streamId = activeStream.id || activeStream._id;
      await axios.put(`/api/streams/${streamId}`, streamSettings);
      await fetchActiveStream();
      alert('Stream settings updated!');
    } catch (error) {
      console.error('Error updating stream:', error);
      alert('Failed to update stream settings');
    }
    setLoading(false);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure? Your current stream key will stop working!')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/streams/regenerate-key');
      // Update user in context
      const updatedUser = { ...user, streamKey: response.data.streamKey };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Stream key regenerated! Please update your streaming software.');
      window.location.reload();
    } catch (error) {
      console.error('Error regenerating key:', error);
      alert('Failed to regenerate stream key');
    }
    setLoading(false);
  };

  const handleEndStream = async () => {
    if (!window.confirm('Are you sure you want to end your stream? This will stop your broadcast.')) {
      return;
    }

    setLoading(true);
    try {
      const streamId = activeStream.id || activeStream._id;
      await axios.post(`/api/streams/${streamId}/end`);
      setActiveStream(null);
      alert('Stream ended successfully!');
    } catch (error) {
      console.error('Error ending stream:', error);
      alert('Failed to end stream. Please stop your broadcast in OBS.');
    }
    setLoading(false);
  };

  const copyToClipboard = (text, type) => {
    // Use modern clipboard API if available (HTTPS or localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopySuccess(type);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error('Clipboard failed:', err);
          fallbackCopy(text, type);
        });
    } else {
      // Fallback for HTTP connections
      fallbackCopy(text, type);
    }
  };

  const fallbackCopy = (text, type) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('Copy failed. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
  };

  const handleViewStream = () => {
    if (activeStream) {
      const streamId = activeStream.id || activeStream._id;
      window.open(`/stream/${streamId}`, '_blank');
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Creator Dashboard</h1>
            <p>Welcome, {user?.displayName || user?.username}</p>
          </div>
          {user?.role === 'admin' && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          )}
        </div>

        <div className="dashboard-content">
          {/* Stream Key Section */}
          <div className="stream-key-section">
            <div className="setup-card">
              <div className="setup-header">
                <Key size={28} />
                <h2>Streaming Setup (OBS/StreamLabs)</h2>
              </div>

              <div className="stream-credentials">
                <div className="credential-item">
                  <label>RTMP Server URL</label>
                  <div className="credential-input-group">
                    <input 
                      type="text" 
                      value={user?.rtmpUrl || 'rtmp://72.23.212.188:1935/live'}
                      readOnly 
                    />
                    <button 
                      className="btn-icon"
                      onClick={() => copyToClipboard(user?.rtmpUrl || 'rtmp://72.23.212.188:1935/live', 'url')}
                      title="Copy URL"
                    >
                      <Copy size={18} />
                      {copySuccess === 'url' && <span className="copy-tooltip">Copied!</span>}
                    </button>
                  </div>
                </div>

                <div className="credential-item">
                  <label>Stream Key</label>
                  <div className="credential-input-group">
                    <input 
                      type={showStreamKey ? 'text' : 'password'} 
                      value={user?.streamKey || 'No stream key'}
                      readOnly 
                    />
                    <button 
                      className="btn-icon"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      title={showStreamKey ? 'Hide' : 'Show'}
                    >
                      {showStreamKey ? '🙈' : '👁️'}
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => copyToClipboard(user?.streamKey, 'key')}
                      title="Copy Key"
                    >
                      <Copy size={18} />
                      {copySuccess === 'key' && <span className="copy-tooltip">Copied!</span>}
                    </button>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary"
                  onClick={handleRegenerateKey}
                  disabled={loading}
                >
                  <RefreshCw size={18} />
                  Regenerate Stream Key
                </button>
              </div>

              <div className="obs-instructions">
                <h3>📹 How to Stream with OBS:</h3>
                <ol>
                  <li>Open OBS Studio</li>
                  <li>Go to Settings → Stream</li>
                  <li>Service: Custom</li>
                  <li>Server: Copy the RTMP URL above</li>
                  <li>Stream Key: Copy your stream key</li>
                  <li>Click OK, then Start Streaming in OBS!</li>
                </ol>
                <a 
                  href="https://obsproject.com/download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="download-obs"
                >
                  <ExternalLink size={16} />
                  Download OBS Studio
                </a>
              </div>
            </div>
          </div>

          {/* Stream Settings */}
          {activeStream ? (
            <div className="stream-active-section">
              <div className="setup-card">
                <div className="setup-header">
                  <Video size={28} />
                  <h2>Live Stream Settings</h2>
                  <div className="live-indicator-badge">
                    <span className="live-dot"></span>
                    LIVE
                  </div>
                </div>

                <div className="form-group">
                  <label>Stream Title</label>
                  <input
                    type="text"
                    value={streamSettings.title}
                    onChange={(e) => setStreamSettings({...streamSettings, title: e.target.value})}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={streamSettings.description}
                    onChange={(e) => setStreamSettings({...streamSettings, description: e.target.value})}
                    maxLength={500}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={streamSettings.category}
                    onChange={(e) => setStreamSettings({...streamSettings, category: e.target.value})}
                  >
                    <option>Just Chatting</option>
                    <option>Gaming</option>
                    <option>Music</option>
                    <option>Creative</option>
                    <option>IRL</option>
                    <option>Sports</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="stream-stats-inline">
                  <div className="stat-inline">
                    <Eye size={20} />
                    <span>{viewerCount} viewers</span>
                  </div>
                </div>

                <div className="stream-actions-inline">
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdateStream}
                    disabled={loading}
                  >
                    <Settings size={18} />
                    Update Settings
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleViewStream}
                  >
                    <Monitor size={18} />
                    View Stream
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleEndStream}
                    disabled={loading}
                  >
                    <Video size={18} />
                    End Stream
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="stream-offline">
              <div className="setup-card">
                <div className="setup-header">
                  <Settings size={28} />
                  <h2>Not Streaming</h2>
                </div>
                <p className="offline-message">
                  Start streaming with OBS using your stream key above. 
                  Your stream will appear automatically when you go live!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
