import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config';
import HLSPlayer from '../components/HLSPlayer';
import UserCard from '../components/UserCard';
import { Eye, Send, Shield, Ban, Trash2, Heart, CheckCircle, Gift } from 'lucide-react';
import { getBadgeById } from '../config/badges';
import './StreamView.css';

const StreamView = () => {
  const { streamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stream, setStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slowMode, setSlowMode] = useState({ enabled: false, seconds: 0 });
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [selectedUsername, setSelectedUsername] = useState(null);
  
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const isModerator = user && (user.role === 'moderator' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';
  const isStreamCreator = user && stream && (user.id === stream.streamer._id || user.id === stream.streamer);

  useEffect(() => {
    fetchStream();
    
    // Connect to Socket.IO with config
    socketRef.current = io(config.SOCKET_URL);
    
    socketRef.current.emit('join-stream', { 
      streamId, 
      username: user?.username || 'Anonymous',
      userId: user?.id || 'anonymous',
      userRole: user?.role || 'user'
    });

    socketRef.current.on('viewer-count', (count) => {
      setViewerCount(count);
    });

    socketRef.current.on('chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketRef.current.on('message-deleted', ({ messageId }) => {
      setChatMessages(prev => prev.filter(m => m.id !== messageId));
    });

    socketRef.current.on('user-banned', ({ username, duration, bannedBy }) => {
      const banMessage = {
        id: Date.now(),
        username: 'System',
        message: `${username} was ${duration === 'permanent' ? 'permanently banned' : `timed out for ${duration}s`} by ${bannedBy}`,
        userRole: 'system',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, banMessage]);
    });

    socketRef.current.on('slow-mode-update', ({ enabled, seconds }) => {
      setSlowMode({ enabled, seconds });
      const slowModeMessage = {
        id: Date.now(),
        username: 'System',
        message: enabled ? `Slow mode enabled: ${seconds}s between messages` : 'Slow mode disabled',
        userRole: 'system',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, slowModeMessage]);
    });

    socketRef.current.on('banned-from-stream', ({ message }) => {
      alert(message);
      navigate('/');
    });

    socketRef.current.on('error-message', ({ message }) => {
      alert(message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-stream', streamId);
        socketRef.current.disconnect();
      }
    };
  }, [streamId, user, navigate]);

  // Check following status when stream is loaded
  useEffect(() => {
    if (user && stream?.streamer?._id) {
      checkFollowing();
    }
  }, [user, stream?.streamer?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchStream = async () => {
    try {
      const response = await axios.get(`/api/streams/${streamId}`);
      setStream(response.data.stream);
      setChatMessages(response.data.chatMessages || []);
      setLoading(false);
      
      // Fetch follower count for the streamer
      if (response.data.stream?.streamerUsername) {
        try {
          const userResponse = await axios.get(`/api/users/${response.data.stream.streamerUsername}`);
          setFollowerCount(userResponse.data.followers || 0);
        } catch (err) {
          console.error('Error fetching follower count:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setLoading(false);
      navigate('/');
    }
  };

  const checkFollowing = async () => {
    if (!stream?.streamer?._id || !user) {
      console.log('⏭️ Skipping follow check:', { hasStream: !!stream?.streamer?._id, hasUser: !!user });
      return;
    }
    try {
      const response = await axios.get(`/api/users/${stream.streamer._id}/following`);
      console.log('✅ Follow check result:', response.data.isFollowing);
      setIsFollowing(response.data.isFollowing);
      setFollowerCount(response.data.followerCount || followerCount);
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert('Please login to follow');
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${stream.streamer._id}/follow`);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await axios.post(`/api/users/${stream.streamer._id}/follow`);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to follow/unfollow. Please try again.');
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    if (!user) {
      alert('Please login to chat');
      return;
    }

    if (slowMode.enabled && !isModerator) {
      const timeSinceLastMessage = (Date.now() - lastMessageTime) / 1000;
      if (timeSinceLastMessage < slowMode.seconds) {
        alert(`Slow mode: Wait ${Math.ceil(slowMode.seconds - timeSinceLastMessage)}s`);
        return;
      }
    }

    socketRef.current.emit('chat-message', {
      streamId,
      username: user.username,
      message: messageInput,
      userId: user.id,
      userRole: user.role || 'user',
      isPartner: user.isPartner || false,
      selectedBadge: user.selectedBadge || null,
      chatColor: user.chatColor || '#FFFFFF'
    });

    setMessageInput('');
    setLastMessageTime(Date.now());
  };

  const handleDeleteMessage = (messageId) => {
    if (isModerator) {
      socketRef.current.emit('delete-message', {
        streamId,
        messageId,
        userId: user.id
      });
    }
  };

  const handleBanUser = (targetUserId, targetUsername, duration = 0) => {
    if (isModerator && window.confirm(`Ban ${targetUsername}?`)) {
      socketRef.current.emit('ban-user', {
        streamId,
        targetUserId,
        targetUsername,
        duration
      });
    }
  };

  const handleUnbanUser = () => {
    const username = prompt('Enter username to unban:');
    if (!username) return;
    
    if ((isAdmin || isStreamCreator) && window.confirm(`Unban ${username}?`)) {
      socketRef.current.emit('unban-user', {
        streamId,
        targetUsername: username
      });
    }
  };

  const toggleSlowMode = () => {
    if (isModerator) {
      const seconds = slowMode.enabled ? 0 : 30;
      socketRef.current.emit('toggle-slow-mode', {
        streamId,
        enabled: !slowMode.enabled,
        seconds
      });
    }
  };

  const getRoleBadge = (role, isStreamer = false, isPartner = false, selectedBadge = null) => {
    const badges = [];
    
    // Custom Badge (if user has one selected) - Show FIRST
    if (selectedBadge) {
      const customBadge = getBadgeById(selectedBadge);
      if (customBadge) {
        badges.push(
          <span key="custom" className="badge badge-custom" title={customBadge.name}>
            <img 
              src={customBadge.imageUrl} 
              alt={customBadge.name}
              style={{ width: '16px', height: '16px', display: 'block' }}
            />
          </span>
        );
      }
    }
    
    if (isPartner) {
      badges.push(
        <span key="partner" className="badge badge-partner" title="Verified Partner">
          <CheckCircle size={16} fill="currentColor" />
        </span>
      );
    }
    
    if (role === 'admin') {
      badges.push(
        <span key="admin" className="badge badge-admin" title="Staff">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        </span>
      );
    } else if (role === 'moderator') {
      badges.push(
        <span key="mod" className="badge badge-moderator" title="Moderator">
          <Shield size={14} />
        </span>
      );
    }
    
    if (isStreamer) {
      badges.push(<span key="streamer" className="badge badge-streamer">STREAMER</span>);
    }
    
    return badges.length > 0 ? badges : null;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#ff4444';
      case 'moderator':
        return '#4444ff';
      default:
        return '#53fc18';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error-message">Stream not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container stream-view-page">
      {/* Left Sidebar - Following (like Kick) */}
      <aside className="stream-left-sidebar">
        <div className="sidebar-header">
          <Heart size={16} />
          <h3>Following</h3>
        </div>
        <div className="no-following">
          <p>Follow channels to see them here when they go live!</p>
        </div>
      </aside>

      <div className="stream-layout">
        <div className="stream-main">
          <div className="video-container">
            <HLSPlayer 
              streamUrl={stream?.streamUrl}
              className="stream-video"
            />
            <div className="video-overlay">
              <div className="live-badge-overlay">
                LIVE
              </div>
              <div className="viewer-badge">
                <Eye size={16} />
                {viewerCount}
              </div>
            </div>
          </div>

          <div className="stream-details-kick">
            <div className="stream-header-kick">
              {/* Profile Picture with LIVE Badge */}
              <div className="streamer-avatar-container">
                <img 
                  src={stream.streamer?.avatar || `https://ui-avatars.com/api/?name=${stream.streamerUsername}&background=00d9ff&color=fff&size=128`}
                  alt={stream.streamerUsername}
                  className="streamer-avatar-large"
                />
                <div className="live-badge-avatar">LIVE</div>
              </div>

              {/* Stream Info */}
              <div className="stream-info-kick">
                <div className="streamer-name-kick">
                  {stream.streamerUsername}
                  {getRoleBadge(
                    stream.streamer?.role,
                    false,
                    stream.streamer?.isPartner
                  )}
                </div>
                <h1 className="stream-title-kick">{stream.title}</h1>
                <div className="stream-tags-kick">
                  <span className="stream-tag">{stream.category || 'Just Chatting'}</span>
                  <span className="stream-tag">English</span>
                  {stream.streamer?.isPartner && <span className="stream-tag">Partner</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="stream-actions-kick">
                {user && user.username !== stream.streamerUsername && (
                  <button 
                    className={`btn-follow-kick ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {stream.streamer?.isAffiliate && (
                  <button className="btn-gift-kick" title="Gift Subs">
                    <Gift size={18} />
                    Gift Subs
                  </button>
                )}
                <button className="btn-subscribe-kick" title="Subscribe">
                  Subscribe
                </button>
                <div className="stream-stats-kick">
                  <Eye size={16} />
                  <span>{viewerCount} Viewers</span>
                </div>
              </div>
            </div>
            {stream.description && (
              <p className="stream-description-kick">{stream.description}</p>
            )}
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-header">
            <h3>Stream Chat</h3>
            <div className="chat-controls">
              {isModerator && (
                <button 
                  className={`btn-icon-small ${slowMode.enabled ? 'active' : ''}`}
                  onClick={toggleSlowMode}
                  title="Toggle Slow Mode"
                >
                  <Shield size={16} />
                </button>
              )}
              {(isAdmin || isStreamCreator) && (
                <button 
                  className="btn-icon-small unban"
                  onClick={handleUnbanUser}
                  title="Unban User"
                >
                  <Ban size={16} style={{ transform: 'rotate(45deg)' }} />
                </button>
              )}
              <div className="chat-viewer-count">
                <Eye size={16} />
                {viewerCount}
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <p>Be the first to chat!</p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg) => {
                  const isMessageFromStreamer = stream && (msg.userId === stream.streamer._id || msg.userId === stream.streamer);
                  const canModerate = (isModerator || isStreamCreator) && msg.userRole !== 'system';
                  const canBan = (isAdmin || isStreamCreator) && msg.userId !== user?.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`chat-message ${msg.userRole === 'system' ? 'system-message' : ''}`}
                    >
                      <span 
                        className="chat-username clickable-username" 
                        style={{ color: msg.chatColor || getRoleColor(msg.userRole) }}
                        onClick={() => setSelectedUsername(msg.username)}
                      >
                        {msg.username}
                        {getRoleBadge(msg.userRole, isMessageFromStreamer, msg.isPartner, msg.selectedBadge)}
                      </span>
                      <span className="chat-text">{msg.message}</span>
                      {canModerate && (
                        <div className="chat-mod-actions">
                          <button 
                            className="btn-mod-action"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete Message"
                          >
                            <Trash2 size={14} />
                          </button>
                          {canBan && msg.userRole !== 'admin' && (
                            <>
                              <button 
                                className="btn-mod-action"
                                onClick={() => handleBanUser(msg.userId, msg.username, 300)}
                                title="Timeout 5min"
                              >
                                <Ban size={14} />
                              </button>
                              {isAdmin && (
                                <button 
                                  className="btn-mod-action ban"
                                  onClick={() => handleBanUser(msg.userId, msg.username, 0)}
                                  title="Permanent Ban"
                                >
                                  <Ban size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={user ? (slowMode.enabled ? `Slow mode: ${slowMode.seconds}s` : 'Send a message...') : 'Login to chat'}
              disabled={!user}
              className="chat-input"
              maxLength={500}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!user || !messageInput.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* User Card Modal */}
      {selectedUsername && (
        <UserCard 
          username={selectedUsername} 
          onClose={() => setSelectedUsername(null)} 
        />
      )}
    </div>
  );
};

export default StreamView;
