import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { User, Calendar, Edit, Heart, Shield, Crown, CheckCircle, Bell, Settings, Send } from 'lucide-react';
import { SOCKET_URL } from '../config';
import { getBadgeById } from '../config/badges';
import UserCard from '../components/UserCard';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    banner: ''
  });
  const [availableBadges, setAvailableBadges] = useState([]);
  const [selectedBadgeForEdit, setSelectedBadgeForEdit] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ avatar: false, banner: false });

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [selectedUsername, setSelectedUsername] = useState(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (currentUser && !isOwnProfile && profile?.id) {
      checkFollowing();
    }
  }, [currentUser, isOwnProfile, profile?.id]);

  // Chat useEffect - connect to global chat room for this profile
  useEffect(() => {
    if (activeTab === 'chat' && profile) {
      // Connect to Socket.IO
      socketRef.current = io(SOCKET_URL);
      const roomName = `profile_${profile.username}`;

      socketRef.current.emit('join-profile-chat', roomName);

      socketRef.current.on('profile-chat-message', (msg) => {
        setChatMessages(prev => [...prev, msg]);
      });

      socketRef.current.on('profile-chat-history', (history) => {
        setChatMessages(history);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave-profile-chat', roomName);
          socketRef.current.disconnect();
        }
      };
    }
  }, [activeTab, profile]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${username}`);
      setProfile(response.data);
      setEditForm({
        displayName: response.data.displayName || '',
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
        banner: response.data.banner || ''
      });
      setSelectedBadgeForEdit(response.data.selectedBadge || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      navigate('/');
    }
  };

  const checkFollowing = async () => {
    if (!profile?.id) return;
    try {
      const response = await axios.get(`/api/users/${profile.id}/following`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Please login to follow');
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${profile.id}/follow`);
        setIsFollowing(false);
        setProfile({ ...profile, followers: profile.followers - 1 });
      } else {
        await axios.post(`/api/users/${profile.id}/follow`);
        setIsFollowing(true);
        setProfile({ ...profile, followers: profile.followers + 1 });
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Update profile info
      await axios.put('/api/users/profile', editForm);
      
      // Update selected badge if changed
      if (selectedBadgeForEdit !== profile.selectedBadge) {
        await axios.post('/api/badges/select', { badgeId: selectedBadgeForEdit });
      }
      
      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const fetchMyBadges = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get('/api/badges/my-badges');
      setAvailableBadges(response.data.customBadges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  // Fetch badges when opening edit modal
  useEffect(() => {
    if (isEditing && isOwnProfile) {
      fetchMyBadges();
    }
  }, [isEditing, isOwnProfile]);

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadProgress({ ...uploadProgress, [type]: true });
    setUploading(true);

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post(`/api/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the form with the uploaded file URL
      const uploadedUrl = response.data.url;
      setEditForm({ ...editForm, [type]: uploadedUrl });
      alert(`${type === 'avatar' ? 'Avatar' : 'Banner'} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadProgress({ ...uploadProgress, [type]: false });
      setUploading(false);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socketRef.current || !currentUser) return;

    const message = {
      username: currentUser.username,
      message: chatMessage,
      userRole: currentUser.role,
      userId: currentUser.id,
      chatColor: currentUser.chatColor,
      isPartner: currentUser.isPartner,
      selectedBadge: currentUser.selectedBadge,
      timestamp: new Date()
    };

    socketRef.current.emit('profile-chat-message', {
      roomName: `profile_${profile.username}`,
      message
    });

    setChatMessage('');
  };

  const handleUpdateBio = async () => {
    if (!isOwnProfile) return;
    
    try {
      await axios.put('/api/users/profile', { bio: bioText });
      setProfile({ ...profile, bio: bioText });
      setIsEditingBio(false);
      alert('Bio updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
    }
  };

  const startEditingBio = () => {
    setBioText(profile.bio || '');
    setIsEditingBio(true);
  };

  const getRoleBadges = () => {
    const badges = [];
    
    // Custom Badge (if user has one selected)
    if (profile?.selectedBadge) {
      const customBadge = getBadgeById(profile.selectedBadge);
      if (customBadge) {
        badges.push(
          <span key="custom" className="channel-badge badge-custom" title={customBadge.name}>
            <img 
              src={customBadge.imageUrl} 
              alt={customBadge.name}
              style={{ width: '20px', height: '20px', display: 'block' }}
            />
          </span>
        );
      }
    }
    
    if (profile?.isPartner) {
      badges.push(
        <span key="partner" className="channel-badge badge-partner" title="Verified Partner">
          <CheckCircle size={18} fill="currentColor" />
        </span>
      );
    }
    
    if (profile?.role === 'admin') {
      badges.push(
        <span key="admin" className="channel-badge badge-admin" title="Staff">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        </span>
      );
    } else if (profile?.role === 'moderator') {
      badges.push(
        <span key="mod" className="channel-badge badge-moderator" title="Moderator">
          <Shield size={18} />
        </span>
      );
    }
    
    return badges;
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

  if (!profile) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error-message">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-page">
      {/* Channel Banner */}
      <div className="channel-banner" style={{
        backgroundImage: (profile.banner && profile.banner.trim() !== '') 
          ? `url(${profile.banner})` 
          : 'linear-gradient(135deg, #1a1a1f 0%, #26262c 100%)',
        backgroundColor: '#1a1a1f'
      }}>
        {profile.isStreamer && !profile.isLive && (
          <div className="offline-badge">OFFLINE</div>
        )}
        {profile.isStreamer && profile.isLive && (
          <div className="live-badge">LIVE</div>
        )}
      </div>

      {/* Channel Header */}
      <div className="channel-header">
        <div className="channel-header-content">
          <div className="channel-avatar-large">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <User size={80} />
            )}
          </div>

          <div className="channel-info">
            <div className="channel-name-row">
              <h1 className="channel-name">{profile.displayName || profile.username}</h1>
              <div className="channel-badges-inline">
                {getRoleBadges()}
              </div>
            </div>
            <div className="channel-stats">
              <span className="channel-handle">@{profile.username}</span>
              <span className="channel-dot">•</span>
              <span className="channel-followers">{profile.followers || 0} followers</span>
              <span className="channel-dot">•</span>
              <span className="channel-following">{profile.following || 0} following</span>
            </div>
            {profile.bio && (
              <div className="channel-bio">{profile.bio}</div>
            )}
          </div>

          <div className="channel-actions">
            {!isOwnProfile && currentUser && (
              <>
                <button className="btn-channel-action btn-subscribe" onClick={handleFollow}>
                  <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-channel-action btn-notify" title="Turn on Notifications">
                  <Bell size={18} />
                </button>
              </>
            )}
            
            {isOwnProfile && (
              <button 
                className="btn-channel-action btn-customize"
                onClick={() => {
                  setEditForm({
                    displayName: profile.displayName || profile.username,
                    bio: profile.bio || '',
                    avatar: profile.avatar || '',
                    banner: profile.banner || ''
                  });
                  setIsEditing(true);
                }}
              >
                <Settings size={18} />
                Customize channel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Channel Navigation */}
      <div className="channel-nav">
        <div className="channel-nav-content">
          <button 
            className={`channel-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`channel-nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`channel-nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button 
            className={`channel-nav-item ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button 
            className={`channel-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Channel Content */}
      <div className="channel-content">
        {activeTab === 'home' && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <h2>About {profile.displayName || profile.username}</h2>
              <div className="about-card">
                {profile.bio && (
                  <div className="about-item">
                    <h3>Bio</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}
                <div className="about-item">
                  <h3>Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{profile.followers || 0}</div>
                      <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{profile.following || 0}</div>
                      <div className="stat-label">Following</div>
                    </div>
                    {profile.isStreamer && (
                      <div className="stat-item">
                        <div className="stat-value">{profile.streamCount || 0}</div>
                        <div className="stat-label">Total Streams</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="about-item">
                  <h3>Details</h3>
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {profile.isStreamer && (
                    <div className="detail-row">
                      <span className="creator-badge-small">Creator</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <div className="about-header">
                <h2>About</h2>
                {isOwnProfile && !isEditingBio && (
                  <button className="btn-edit-bio" onClick={startEditingBio}>
                    <Edit size={16} />
                    Edit Bio
                  </button>
                )}
              </div>
              <div className="about-card">
                {isEditingBio ? (
                  <div className="bio-edit-container">
                    <textarea
                      className="bio-edit-textarea"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Tell everyone about yourself..."
                      maxLength={500}
                      rows={6}
                    />
                    <div className="bio-edit-actions">
                      <button className="btn btn-primary" onClick={handleUpdateBio}>
                        Save Bio
                      </button>
                      <button className="btn btn-secondary" onClick={() => setIsEditingBio(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile.bio ? (
                      <p className="about-description">{profile.bio}</p>
                    ) : (
                      <p className="about-description empty">
                        {isOwnProfile ? 'Click "Edit Bio" to add a description.' : 'No description available.'}
                      </p>
                    )}
                  </>
                )}
                
                <div className="about-details">
                  <div className="about-detail-item">
                    <strong>Joined:</strong>
                    <span>{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="about-detail-item">
                    <strong>Followers:</strong>
                    <span>{profile.followers || 0}</span>
                  </div>
                  <div className="about-detail-item">
                    <strong>Following:</strong>
                    <span>{profile.following || 0}</span>
                  </div>
                  {profile.isStreamer && (
                    <div className="about-detail-item">
                      <strong>Account Type:</strong>
                      <span>Creator</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <h2>Stream Schedule</h2>
              <div className="empty-state">
                <p>No scheduled streams yet.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <h2>Videos & VODs</h2>
              <div className="empty-state">
                <p>No videos available yet.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <h2>{profile.displayName || profile.username}'s Chat Room</h2>
              <div className="profile-chat-container">
                <div className="profile-chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="chat-empty-state">
                      <p>No messages yet. Be the first to say hello!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className="profile-chat-message">
                        <span className="profile-chat-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        <span 
                          className="profile-chat-username clickable-username" 
                          style={{ color: msg.chatColor || '#00d9ff' }}
                          onClick={() => setSelectedUsername(msg.username)}
                        >
                          {msg.username}
                          {msg.selectedBadge && (() => {
                            const customBadge = getBadgeById(msg.selectedBadge);
                            return customBadge ? (
                              <img 
                                src={customBadge.imageUrl} 
                                alt={customBadge.name}
                                title={customBadge.name}
                                style={{ width: '14px', height: '14px', marginLeft: '4px', verticalAlign: 'middle' }}
                              />
                            ) : null;
                          })()}
                          {msg.isPartner && (
                            <CheckCircle 
                              size={12} 
                              fill="#00ffff" 
                              style={{ marginLeft: '4px', verticalAlign: 'middle' }} 
                            />
                          )}
                          {msg.userRole === 'admin' && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#00ffff"
                              style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                            >
                              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                            </svg>
                          )}
                          {msg.userRole === 'moderator' && (
                            <Shield 
                              size={12} 
                              color="#00ffff" 
                              style={{ marginLeft: '4px', verticalAlign: 'middle' }} 
                            />
                          )}
                        </span>
                        <span className="profile-chat-text">{msg.message}</span>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {currentUser ? (
                  <form className="profile-chat-input-container" onSubmit={handleSendChatMessage}>
                    <input
                      type="text"
                      className="profile-chat-input"
                      placeholder={`Chat as ${currentUser.username}...`}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <button type="submit" className="profile-chat-send">
                      <Send size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="profile-chat-login-prompt">
                    <p>Please <a href="/login">login</a> to chat</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content channel-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customize Channel</h2>
              <button className="btn-close" onClick={() => setIsEditing(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                    placeholder="Your display name"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                </div>

                <div className="form-group">
                  <label>Avatar</label>
                  <div className="upload-section">
                    <input
                      type="text"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                      placeholder="https://example.com/avatar.jpg or upload below"
                      className="url-input"
                    />
                    <div className="upload-or">OR</div>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label htmlFor="avatar-upload" className="btn-upload">
                        {uploadProgress.avatar ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {editForm.avatar && (
                        <div className="image-preview">
                          <img src={editForm.avatar} alt="Avatar preview" />
                        </div>
                      )}
                    </div>
                  </div>
                  <small>Max 5MB • JPEG, PNG, GIF, WebP</small>
                </div>

                <div className="form-group">
                  <label>Banner</label>
                  <div className="upload-section">
                    <input
                      type="text"
                      value={editForm.banner}
                      onChange={(e) => setEditForm({...editForm, banner: e.target.value})}
                      placeholder="https://example.com/banner.jpg or upload below"
                      className="url-input"
                    />
                    <div className="upload-or">OR</div>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="banner-upload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner')}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label htmlFor="banner-upload" className="btn-upload">
                        {uploadProgress.banner ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {editForm.banner && (
                        <div className="image-preview banner-preview">
                          <img src={editForm.banner} alt="Banner preview" />
                        </div>
                      )}
                    </div>
                  </div>
                  <small>Recommended size: 2560x423px • Max 5MB</small>
                </div>

                {/* Badge Selection */}
                <div className="form-group">
                  <label>Display Badge</label>
                  {availableBadges.length > 0 ? (
                    <>
                      <small style={{ display: 'block', marginBottom: '10px', color: '#888' }}>
                        Select a badge to display on your profile and in chat
                      </small>
                      <div className="badge-selector-grid">
                        <div 
                          className={`badge-selector-item ${selectedBadgeForEdit === null ? 'selected' : ''}`}
                          onClick={() => setSelectedBadgeForEdit(null)}
                        >
                          <div className="badge-selector-none">
                            <span>No Badge</span>
                          </div>
                        </div>
                        {availableBadges.map((badgeId) => {
                          const badge = getBadgeById(badgeId);
                          if (!badge) return null;
                          return (
                            <div
                              key={badgeId}
                              className={`badge-selector-item ${selectedBadgeForEdit === badgeId ? 'selected' : ''}`}
                              onClick={() => setSelectedBadgeForEdit(badgeId)}
                            >
                              <img 
                                src={badge.imageUrl} 
                                alt={badge.name}
                                className="badge-selector-image"
                              />
                              <div className="badge-selector-name">{badge.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="no-badges-message">
                      <p style={{ color: '#888', fontSize: '14px', margin: '10px 0' }}>
                        No custom badges assigned yet. Contact an admin to get badges!
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default Profile;
