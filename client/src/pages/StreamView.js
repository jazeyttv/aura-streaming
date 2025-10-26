import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config';
import HLSPlayer from '../components/HLSPlayer';
import UserCard from '../components/UserCard';
import ModTools from '../components/ModTools';
import { Eye, Send, Shield, Ban, Trash2, Heart, CheckCircle, Gift, Flag, ChevronDown, ChevronUp, Trophy, Users, Crown } from 'lucide-react';
import { getBadgeById } from '../config/badges';
import ReportModal from '../components/ReportModal';
import ConfirmModal from '../components/ConfirmModal';
import './KickStreamView.css';

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
  const [showModTools, setShowModTools] = useState(false);
  const [modTargetUser, setModTargetUser] = useState(null);
  const [channelMods, setChannelMods] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardCollapsed, setLeaderboardCollapsed] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [followingStreams, setFollowingStreams] = useState([]);
  const [recommendedStreams, setRecommendedStreams] = useState([]);
  
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const watchTimeInterval = useRef(null);
  const watchStartTime = useRef(null);

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

    // Start watch time tracking if user is logged in
    if (user) {
      watchStartTime.current = Date.now();
      
      // Send watch time every minute
      watchTimeInterval.current = setInterval(() => {
        const minutesWatched = Math.floor((Date.now() - watchStartTime.current) / 60000);
        if (minutesWatched > 0) {
          trackWatchTime(minutesWatched);
          watchStartTime.current = Date.now(); // Reset timer
        }
      }, 60000); // Check every minute
    }

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
      const errorMsg = {
        id: Date.now(),
        username: 'System',
        message: message,
        userRole: 'error',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    });

    socketRef.current.on('system-message', ({ message, username }) => {
      const systemMsg = {
        id: Date.now(),
        username: username || 'System',
        message: message,
        userRole: 'system',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, systemMsg]);
    });

    return () => {
      // Track remaining watch time before leaving
      if (user && watchStartTime.current) {
        const minutesWatched = Math.floor((Date.now() - watchStartTime.current) / 60000);
        if (minutesWatched > 0) {
          trackWatchTime(minutesWatched);
        }
      }

      // Clear watch time interval
      if (watchTimeInterval.current) {
        clearInterval(watchTimeInterval.current);
      }

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

  // Fetch leaderboard periodically
  useEffect(() => {
    if (streamId) {
      fetchLeaderboard();
      
      // Update leaderboard every 5 seconds
      const leaderboardInterval = setInterval(() => {
        fetchLeaderboard();
      }, 5000);
      
      return () => clearInterval(leaderboardInterval);
    }
  }, [streamId]);

  useEffect(() => {
    fetchFollowingStreams();
    fetchRecommendedStreams();
    
    // Update every 30 seconds
    const sidebarInterval = setInterval(() => {
      fetchFollowingStreams();
      fetchRecommendedStreams();
    }, 30000);
    
    return () => clearInterval(sidebarInterval);
  }, [user]);

  const fetchStream = async () => {
    try {
      const response = await axios.get(`/api/streams/${streamId}`);
      setStream(response.data.stream);
      setChatMessages(response.data.chatMessages || []);
      setLoading(false);
      
      // Fetch follower count and moderators for the streamer
      if (response.data.stream?.streamerUsername) {
        try {
          const userResponse = await axios.get(`/api/users/${response.data.stream.streamerUsername}`);
          setFollowerCount(userResponse.data.followers || 0);
          setChannelMods(userResponse.data.moderators || []);
        } catch (err) {
          console.error('Error fetching streamer data:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setLoading(false);
      navigate('/');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`/api/leaderboard/stream/${streamId}/top-watchers`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchFollowingStreams = async () => {
    try {
      if (user) {
        const response = await axios.get('/api/users/following/live');
        setFollowingStreams(response.data);
      }
    } catch (error) {
      console.error('Error fetching following streams:', error);
    }
  };

  const fetchRecommendedStreams = async () => {
    try {
      const response = await axios.get('/api/streams/live');
      // Get random 5 streams, excluding current stream
      const others = response.data.filter(s => s._id !== streamId);
      const shuffled = others.sort(() => 0.5 - Math.random());
      setRecommendedStreams(shuffled.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recommended streams:', error);
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

  const trackWatchTime = async (minutes) => {
    if (!user || !stream) return;
    
    try {
      await axios.post('/api/stats/add-watch-time', {
        minutes,
        streamerId: stream.streamer._id || stream.streamer,
        streamerUsername: stream.streamerUsername,
        streamTitle: stream.title
      });
      console.log(`✅ Tracked ${minutes} minute(s) of watch time`);
    } catch (error) {
      console.error('Error tracking watch time:', error);
    }
  };

  const trackMessage = async () => {
    if (!user) return;
    
    try {
      await axios.post('/api/stats/add-message', {}, {
        validateStatus: function (status) {
          // Don't throw error on any status, just log it
          return true;
        }
      });
    } catch (error) {
      // Silently fail - message was already sent via socket
      console.log('Stats tracking skipped:', error.message);
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
      chatColor: user.chatColor || '#FFFFFF',
      channelName: stream?.streamerUsername || stream?.streamer?.username
    });

    // Track message for stats
    trackMessage();

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
    if (isModerator) {
      setBanTarget({ targetUserId, targetUsername, duration });
      setShowBanModal(true);
    }
  };

  const confirmBan = () => {
    if (banTarget) {
      socketRef.current.emit('ban-user', {
        streamId,
        targetUserId: banTarget.targetUserId,
        targetUsername: banTarget.targetUsername,
        duration: banTarget.duration
      });
      setShowBanModal(false);
      setBanTarget(null);
    }
  };

  const handleUnbanUser = () => {
    setShowUnbanModal(true);
  };

  const submitUnban = (username) => {
    if (!username || !username.trim()) return;
    
    if (isAdmin || isStreamCreator) {
      socketRef.current.emit('unban-user', {
        streamId,
        targetUsername: username.trim()
      });
      setShowUnbanModal(false);
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

  const getRoleBadge = (role, isStreamer = false, isPartner = false, selectedBadge = null, userId = null) => {
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
    } else if (userId && channelMods.includes(userId)) {
      // Channel-specific moderator
      badges.push(
        <span key="channel-mod" className="badge badge-moderator" title="Channel Moderator">
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
      <div className="kick-stream-loading">
        <div className="kick-loading-spinner"></div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="kick-stream-loading">
        <div style={{ color: '#efeff1', textAlign: 'center' }}>Stream not found</div>
      </div>
    );
  }

  return (
    <div className="kick-stream-page">
      {/* Left Sidebar - Following & Recommended */}
      <aside className="kick-stream-left-sidebar">
        <div className="kick-sidebar-section">
          <h4 className="kick-sidebar-title">FOLLOWING</h4>
          <div className="kick-sidebar-channels">
            {followingStreams.length === 0 ? (
              <>
                <p className="kick-sidebar-empty">No live channels</p>
                <p className="kick-sidebar-hint">Follow channels to see them here</p>
              </>
            ) : (
              followingStreams.map((stream) => (
                <div 
                  key={stream._id} 
                  className="kick-sidebar-channel"
                  onClick={() => navigate(`/stream/${stream._id}`)}
                >
                  <div className="kick-sidebar-channel-avatar">
                    {stream.streamer?.avatar ? (
                      <img src={stream.streamer.avatar} alt={stream.streamer?.username || 'Streamer'} />
                    ) : (
                      <div className="kick-sidebar-channel-avatar-placeholder">
                        {(stream.streamer?.username || stream.streamerUsername || 'S')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="kick-sidebar-live-badge">LIVE</div>
                  </div>
                  <div className="kick-sidebar-channel-info">
                    <div className="kick-sidebar-channel-name">{stream.streamer?.username || stream.streamerUsername || 'Unknown'}</div>
                    <div className="kick-sidebar-channel-category">{stream.category || 'Just Chatting'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="kick-sidebar-section">
          <h4 className="kick-sidebar-title">RECOMMENDED</h4>
          <div className="kick-sidebar-channels">
            {recommendedStreams.length === 0 ? (
              <>
                <p className="kick-sidebar-empty">No recommendations</p>
                <p className="kick-sidebar-hint">Check back later for suggestions</p>
              </>
            ) : (
              recommendedStreams.map((stream) => (
                <div 
                  key={stream._id} 
                  className="kick-sidebar-channel"
                  onClick={() => navigate(`/stream/${stream._id}`)}
                >
                  <div className="kick-sidebar-channel-avatar">
                    {stream.streamer?.avatar ? (
                      <img src={stream.streamer.avatar} alt={stream.streamer?.username || 'Streamer'} />
                    ) : (
                      <div className="kick-sidebar-channel-avatar-placeholder">
                        {(stream.streamer?.username || stream.streamerUsername || 'S')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="kick-sidebar-live-badge">LIVE</div>
                  </div>
                  <div className="kick-sidebar-channel-info">
                    <div className="kick-sidebar-channel-name">{stream.streamer?.username || stream.streamerUsername || 'Unknown'}</div>
                    <div className="kick-sidebar-channel-category">{stream.category || 'Just Chatting'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Video Section */}
      <div className="kick-stream-main">
        {/* Video Player */}
        <div className="kick-stream-video-container">
          <HLSPlayer 
            streamUrl={stream?.streamUrl}
            className="kick-video-player"
          />
          {/* Video Overlay with Live Badge and Viewer Count */}
          <div className="kick-video-overlay">
            <div className="kick-live-badge">
              <span className="kick-live-dot"></span>
              LIVE
            </div>
            <div className="kick-viewer-badge">
              <Eye size={14} />
              {viewerCount}
            </div>
          </div>
        </div>

        {/* Stream Info Section */}
        <div className="kick-stream-info-section">
          <div className="kick-stream-header">
            {/* Streamer Info */}
            <div className="kick-streamer-info">
              <div className="kick-streamer-avatar-container">
                {stream.streamer?.avatar ? (
                  <img 
                    src={stream.streamer.avatar}
                    alt={stream.streamerUsername}
                    className="kick-streamer-avatar-large"
                  />
                ) : (
                  <div className="kick-streamer-avatar-placeholder-large">
                    {stream.streamerUsername[0].toUpperCase()}
                  </div>
                )}
                <div className="kick-streamer-live-badge">LIVE</div>
              </div>
              
              <div className="kick-streamer-details">
                <h1 className="kick-stream-title">{stream.title}</h1>
                <div className="kick-streamer-name-row">
                  <span className="kick-streamer-name" onClick={() => navigate(`/profile/${stream.streamerUsername}`)}>
                    {stream.streamerUsername}
                    {stream.streamer?.isPartner && (
                      <CheckCircle size={14} color="#53fc18" fill="#53fc18" />
                    )}
                  </span>
                  <span className="kick-stream-category">{stream.category || 'Just Chatting'}</span>
                </div>
                <div className="kick-stream-stats">
                  <div className="kick-viewer-count">
                    <Eye size={14} />
                    {viewerCount}
                  </div>
                  <div className="kick-follower-count">
                    <Users size={14} />
                    {followerCount} Followers
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="kick-stream-actions">
              {user && user.username !== stream.streamerUsername && (
                <button
                  className={`kick-follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button className="kick-subscribe-btn">
                <Gift size={18} />
                Subscribe
              </button>
              {user && !isStreamCreator && (
                <button
                  className="kick-action-icon-btn"
                  onClick={() => setShowReportModal(true)}
                  title="Report stream"
                >
                  <Flag size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {stream.description && (
            <div className="kick-stream-description">
              <p className="kick-description-text">{stream.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar - Kick Style */}
      <div className="kick-chat-sidebar">
        {/* Chat Header */}
        <div className="kick-chat-header">
          <h3 className="kick-chat-title">Chat</h3>
          <div className="kick-chat-controls">
            {isModerator && (
              <button 
                className={`kick-chat-icon-btn ${slowMode.enabled ? 'active' : ''}`}
                onClick={toggleSlowMode}
                title="Toggle Slow Mode"
              >
                <Shield size={16} />
              </button>
            )}
            {(isAdmin || isStreamCreator) && (
              <button 
                className="kick-chat-icon-btn"
                onClick={handleUnbanUser}
                title="Unban User"
              >
                <Ban size={16} />
              </button>
            )}
            <div className="kick-chat-icon-btn">
              <Eye size={16} />
            </div>
          </div>
        </div>

        {/* Watch Time Leaderboard */}
        <div className="kick-chat-leaderboard">
          <div 
            className="kick-leaderboard-header"
            onClick={() => setLeaderboardCollapsed(!leaderboardCollapsed)}
          >
            <div className="kick-leaderboard-title">
              <Trophy size={16} />
              <span>Watch time</span>
              {leaderboard.length > 0 && (
                <span className="kick-leaderboard-count">{leaderboard.length}</span>
              )}
            </div>
            <button className="kick-chat-icon-btn">
              {leaderboardCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          
          {!leaderboardCollapsed && (
            <div className="kick-leaderboard-content">
              {leaderboard.length === 0 ? (
                <div className="kick-leaderboard-empty">
                  <Trophy size={24} />
                  <p>No watchers yet</p>
                  <span>Watch time will appear here</span>
                </div>
              ) : (
                leaderboard.map((viewer, index) => (
                  <div 
                    key={index} 
                    className={`kick-leaderboard-item ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''}`}
                  >
                    <div className="kick-leaderboard-rank">#{index + 1}</div>
                    <div 
                      className="kick-leaderboard-user"
                      onClick={() => setSelectedUsername(viewer.username)}
                    >
                      {viewer.avatar ? (
                        <img 
                          src={viewer.avatar} 
                          alt={viewer.displayName} 
                          className="kick-leaderboard-avatar"
                        />
                      ) : (
                        <div className="kick-leaderboard-avatar-placeholder">
                          {viewer.displayName[0].toUpperCase()}
                        </div>
                      )}
                      <span className="kick-leaderboard-username">{viewer.displayName}</span>
                    </div>
                    <div className="kick-leaderboard-time">{viewer.watchTimeFormatted}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="kick-chat-messages">
          {chatMessages.length === 0 ? (
            <div className="kick-chat-empty">
              <p>Welcome to the chat!</p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg) => {
                const isMessageFromStreamer = stream && (msg.userId === stream.streamer._id || msg.userId === stream.streamer);
                const isChannelMod = user && channelMods.includes(user.id);
                const canModerate = (isModerator || isStreamCreator || isChannelMod) && msg.userRole !== 'system' && msg.userRole !== 'error';
                const canBan = (isAdmin || isStreamCreator || isChannelMod) && msg.userId !== user?.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`kick-chat-message ${msg.userRole === 'system' ? 'system' : ''}`}
                  >
                    {getRoleBadge(msg.userRole, isMessageFromStreamer, msg.isPartner, msg.selectedBadge, msg.userId)}
                    <span 
                      className="kick-chat-username" 
                      style={{ color: msg.chatColor || getRoleColor(msg.userRole) }}
                      onClick={() => {
                        if (canModerate && msg.userRole !== 'system' && msg.userRole !== 'error') {
                          setModTargetUser({ _id: msg.userId, username: msg.username });
                          setShowModTools(true);
                        } else {
                          setSelectedUsername(msg.username);
                        }
                      }}
                    >
                      {msg.username}
                    </span>
                    <span className="kick-chat-separator">: </span>
                    <span className="kick-chat-text">{msg.message}</span>
                    {canModerate && (
                      <div className="kick-chat-mod-actions">
                        <button 
                          className="kick-btn-mod-action"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete Message"
                        >
                          <Trash2 size={12} />
                        </button>
                        {canBan && msg.userRole !== 'admin' && (
                          <>
                            <button 
                              className="kick-btn-mod-action"
                              onClick={() => handleBanUser(msg.userId, msg.username, 300)}
                              title="Timeout 5min"
                            >
                              <Ban size={12} />
                            </button>
                            {isAdmin && (
                              <button 
                                className="kick-btn-mod-action danger"
                                onClick={() => handleBanUser(msg.userId, msg.username, 0)}
                                title="Permanent Ban"
                              >
                                <Ban size={12} />
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

        {/* Chat Input */}
        <form className="kick-chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={user ? (slowMode.enabled ? `Slow mode: ${slowMode.seconds}s` : 'Send a message...') : 'Login to chat'}
            disabled={!user}
            className="kick-chat-input"
            maxLength={500}
          />
          <button 
            type="submit" 
            className="kick-chat-send-btn"
            disabled={!user || !messageInput.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* User Card Modal */}
      {selectedUsername && (
        <UserCard 
          username={selectedUsername} 
          onClose={() => setSelectedUsername(null)} 
        />
      )}

      {/* Mod Tools */}
      {showModTools && modTargetUser && (
        <ModTools
          targetUser={modTargetUser}
          channelName={stream?.streamerUsername || stream?.streamer?.username}
          onClose={() => {
            setShowModTools(false);
            setModTargetUser(null);
          }}
        />
      )}

      {showReportModal && stream && (
        <ReportModal
          stream={stream}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Unban User Modal */}
      <ConfirmModal
        isOpen={showUnbanModal}
        onClose={() => setShowUnbanModal(false)}
        onConfirm={submitUnban}
        title="Unban User"
        message="Enter the username of the user you want to unban:"
        confirmText="Unban"
        requireInput={true}
        inputPlaceholder="Username"
      />

      {/* Ban User Modal */}
      <ConfirmModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanTarget(null);
        }}
        onConfirm={confirmBan}
        title="Ban User"
        message={banTarget ? `Are you sure you want to ban ${banTarget.targetUsername}?` : ''}
        confirmText="Ban"
        danger={true}
      />
    </div>
  );
};

export default StreamView;
