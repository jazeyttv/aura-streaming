import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Calendar, Edit, Heart, Shield, Crown, CheckCircle, Bell, Settings } from 'lucide-react';
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

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (currentUser && !isOwnProfile && profile?.id) {
      checkFollowing();
    }
  }, [currentUser, isOwnProfile, profile?.id]);

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
      await axios.put('/api/users/profile', editForm);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const getRoleBadges = () => {
    const badges = [];
    
    if (profile?.isPartner) {
      badges.push(
        <span key="partner" className="channel-badge badge-partner" title="Verified Partner">
          <CheckCircle size={14} fill="currentColor" />
        </span>
      );
    }
    
    if (profile?.role === 'admin') {
      badges.push(
        <span key="admin" className="channel-badge badge-admin" title="Administrator">
          <Crown size={14} />
        </span>
      );
    } else if (profile?.role === 'moderator') {
      badges.push(
        <span key="mod" className="channel-badge badge-moderator" title="Moderator">
          <Shield size={14} />
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
        backgroundImage: profile.banner ? `url(${profile.banner})` : 'linear-gradient(135deg, #1a1a1f 0%, #26262c 100%)'
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
                onClick={() => setIsEditing(true)}
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
          {profile.isStreamer && (
            <button 
              className={`channel-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
          )}
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
              <h2>About</h2>
              <div className="about-card">
                {profile.bio ? (
                  <p className="about-description">{profile.bio}</p>
                ) : (
                  <p className="about-description empty">No description available.</p>
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

        {activeTab === 'chat' && profile.isStreamer && (
          <div className="channel-tab-content">
            <div className="channel-section">
              <h2>Chat Settings</h2>
              <div className="empty-state">
                <p>Chat settings coming soon.</p>
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
                  <label>Avatar URL</label>
                  <input
                    type="url"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Banner URL</label>
                  <input
                    type="url"
                    value={editForm.banner}
                    onChange={(e) => setEditForm({...editForm, banner: e.target.value})}
                    placeholder="https://example.com/banner.jpg"
                  />
                  <small>Recommended size: 2560x423px</small>
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
    </div>
  );
};

export default Profile;
