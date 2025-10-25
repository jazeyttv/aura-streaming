import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Calendar, Edit, Heart } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: ''
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
        avatar: response.data.avatar || ''
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
    <div className="page-container">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} />
              ) : (
                <User size={60} />
              )}
            </div>
            
            <div className="profile-info">
              <div className="profile-names">
                <h1>{profile.displayName || profile.username}</h1>
                <span className="profile-username">@{profile.username}</span>
              </div>
              
              {profile.isStreamer && (
                <div className="streamer-badge">Creator</div>
              )}
              
              <div className="profile-meta">
                <Calendar size={16} />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="profile-actions">
                {isOwnProfile && !isEditing && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={18} />
                    Edit Profile
                  </button>
                )}
                
                {!isOwnProfile && currentUser && (
                  <button 
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleFollow}
                  >
                    <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="profile-edit">
              <h2>Edit Profile</h2>
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
          ) : (
            <div className="profile-content">
              {profile.bio && (
                <div className="profile-bio">
                  <h2>About</h2>
                  <p>{profile.bio}</p>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-card">
                  <span className="stat-value">{profile.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{profile.following}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

