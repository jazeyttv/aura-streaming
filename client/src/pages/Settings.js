import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Key, Bell, Shield, Save, Share2, Clock, Layout, Users } from 'lucide-react';
import axios from 'axios';
import { getBadgeById } from '../config/badges';
import ScheduleEditor from '../components/ScheduleEditor';
import PanelsEditor from '../components/PanelsEditor';
import TeamManager from '../components/TeamManager';
import TeamInvites from '../components/TeamInvites';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    banner: user?.banner || ''
  });

  const [socialMedia, setSocialMedia] = useState({
    instagram: user?.socialMedia?.instagram || '',
    twitter: user?.socialMedia?.twitter || '',
    facebook: user?.socialMedia?.facebook || '',
    youtube: user?.socialMedia?.youtube || '',
    discord: user?.socialMedia?.discord || '',
    tiktok: user?.socialMedia?.tiktok || ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [availableBadges, setAvailableBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(user?.selectedBadge || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ avatar: false, banner: false });

  // Fetch user's badges on mount
  useEffect(() => {
    fetchMyBadges();
  }, []);

  const fetchMyBadges = async () => {
    try {
      const response = await axios.get('/api/badges/my-badges');
      setAvailableBadges(response.data.customBadges || []);
      setSelectedBadge(response.data.selectedBadge || null);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
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
      setProfileData({ ...profileData, [type]: uploadedUrl });
      setMessage(`${type === 'avatar' ? 'Avatar' : 'Banner'} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadProgress({ ...uploadProgress, [type]: false });
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update profile info
      const response = await axios.put('/api/users/profile', profileData);
      
      // Update selected badge if changed
      if (selectedBadge !== user.selectedBadge) {
        await axios.post('/api/badges/select', { badgeId: selectedBadge });
      }
      
      // Update user in context and localStorage
      const updatedUser = { ...user, ...response.data.user, selectedBadge };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Profile updated successfully!');
      
      // If username changed, refresh after 2 seconds
      if (profileData.username !== user.username) {
        setTimeout(() => {
          window.location.href = '/settings';
        }, 2000);
      } else {
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleSocialMediaUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put('/api/users/profile', { socialMedia });
      
      // Update user in context and localStorage
      const updatedUser = { ...user, socialMedia: response.data.user.socialMedia };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Social media links updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update social media');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.put('/api/users/password', {
        newPassword: passwordData.newPassword
      });
      
      setMessage('Password changed successfully!');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="page-container">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>Settings</h1>
          
          <div className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Key size={18} />
              <span>Password</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <Share2 size={18} />
              <span>Social Media</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Clock size={18} />
              <span>Stream Schedule</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'panels' ? 'active' : ''}`}
              onClick={() => setActiveTab('panels')}
            >
              <Layout size={18} />
              <span>Channel Panels</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            
            <button
              className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} />
              <span>Privacy</span>
            </button>

            {user?.isPartner && (
              <button
                className={`settings-nav-item ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                <Users size={18} />
                <span>Team</span>
              </button>
            )}
          </div>
        </div>

        <div className="settings-content">
          {message && (
            <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <p className="section-description">Update your public profile information</p>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="Your username"
                    minLength={3}
                    maxLength={30}
                    required
                  />
                  <small>This is your unique identifier (letters, numbers, underscore only)</small>
                </div>

                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    placeholder="Your display name"
                    maxLength={50}
                  />
                  <small>This is how your name appears to others</small>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Avatar</label>
                  <div className="upload-section">
                    <input
                      type="text"
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg or upload below"
                      className="url-input"
                    />
                    <div className="upload-or">OR</div>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="avatar-upload-settings"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label htmlFor="avatar-upload-settings" className="btn-upload">
                        {uploadProgress.avatar ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {profileData.avatar && (
                        <div className="image-preview">
                          <img src={profileData.avatar} alt="Avatar preview" />
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
                      value={profileData.banner}
                      onChange={(e) => setProfileData({ ...profileData, banner: e.target.value })}
                      placeholder="https://example.com/banner.jpg or upload below"
                      className="url-input"
                    />
                    <div className="upload-or">OR</div>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="banner-upload-settings"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner')}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                      <label htmlFor="banner-upload-settings" className="btn-upload">
                        {uploadProgress.banner ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {profileData.banner && (
                        <div className="image-preview banner-preview">
                          <img src={profileData.banner} alt="Banner preview" />
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
                          className={`badge-selector-item ${selectedBadge === null ? 'selected' : ''}`}
                          onClick={() => setSelectedBadge(null)}
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
                              className={`badge-selector-item ${selectedBadge === badgeId ? 'selected' : ''}`}
                              onClick={() => setSelectedBadge(badgeId)}
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

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <p className="section-description">Update your account password</p>

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                  <small>Must be at least 6 characters</small>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="settings-section">
              <h2>Social Media</h2>
              <p className="section-description">Add your social media profiles to appear on your channel</p>

              <form onSubmit={handleSocialMediaUpdate} className="settings-form">
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    value={socialMedia.instagram}
                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="text"
                    value={socialMedia.twitter}
                    onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="text"
                    value={socialMedia.facebook}
                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>YouTube</label>
                  <input
                    type="text"
                    value={socialMedia.youtube}
                    onChange={(e) => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Discord</label>
                  <input
                    type="text"
                    value={socialMedia.discord}
                    onChange={(e) => setSocialMedia({ ...socialMedia, discord: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>TikTok</label>
                  <input
                    type="text"
                    value={socialMedia.tiktok}
                    onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="settings-section">
              <ScheduleEditor username={user.username} />
            </div>
          )}

          {activeTab === 'panels' && (
            <div className="settings-section">
              <PanelsEditor username={user.username} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">Manage your notifications and team invitations</p>
              
              <TeamInvites />
              
              <div className="settings-placeholder" style={{ marginTop: '40px' }}>
                <Bell size={48} />
                <p>Additional notification settings coming soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <p className="section-description">Control your privacy and security settings</p>
              
              <div className="settings-placeholder">
                <Shield size={48} />
                <p>Privacy settings coming soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="settings-section">
              <h2>Team Management</h2>
              <p className="section-description">Create and manage your streaming team</p>
              <TeamManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

