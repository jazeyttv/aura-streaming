import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, CheckCircle, Calendar, Users, MessageCircle, X } from 'lucide-react';
import { getBadgeById } from '../config/badges';
import './UserCard.css';

const UserCard = ({ username, onClose }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/users/${username}`);
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${username}`);
    onClose();
  };

  const getRoleBadges = () => {
    if (!userData) return null;
    const badges = [];

    // Custom Badge
    if (userData.selectedBadge) {
      const customBadge = getBadgeById(userData.selectedBadge);
      if (customBadge) {
        badges.push(
          <div key="custom" className="user-card-badge" title={customBadge.name}>
            <img 
              src={customBadge.imageUrl} 
              alt={customBadge.name}
              style={{ width: '24px', height: '24px' }}
            />
          </div>
        );
      }
    }

    // Partner Badge
    if (userData.isPartner) {
      badges.push(
        <div key="partner" className="user-card-badge partner" title="Verified Partner">
          <CheckCircle size={20} fill="#00d9ff" color="#00d9ff" />
        </div>
      );
    }

    // Role Badges
    if (userData.role === 'admin') {
      badges.push(
        <div key="admin" className="user-card-badge admin" title="Admin">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ffff">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        </div>
      );
    } else if (userData.role === 'moderator') {
      badges.push(
        <div key="mod" className="user-card-badge moderator" title="Moderator">
          <Shield size={20} color="#00ffff" />
        </div>
      );
    }

    return badges;
  };

  if (loading) {
    return (
      <div className="user-card-overlay" onClick={onClose}>
        <div className="user-card" onClick={(e) => e.stopPropagation()}>
          <div className="user-card-loading">
            <div className="spinner-small"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="user-card-overlay" onClick={onClose}>
        <div className="user-card" onClick={(e) => e.stopPropagation()}>
          <div className="user-card-error">
            <p>User not found</p>
            <button className="btn-user-card-close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(userData.createdAt).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="user-card-overlay" onClick={onClose}>
      <div className="user-card" onClick={(e) => e.stopPropagation()}>
        <button className="user-card-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Banner */}
        <div 
          className="user-card-banner" 
          style={{
            backgroundImage: userData.banner 
              ? `url(${userData.banner})` 
              : 'linear-gradient(135deg, #1a1a1f 0%, #26262c 100%)'
          }}
        />

        {/* Avatar */}
        <div className="user-card-avatar-wrapper">
          <div className="user-card-avatar">
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.username} />
            ) : (
              <div className="user-card-avatar-placeholder">
                {userData.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="user-card-content">
          <div className="user-card-name-section">
            <h3 className="user-card-display-name">
              {userData.displayName || userData.username}
            </h3>
            <div className="user-card-badges">
              {getRoleBadges()}
            </div>
          </div>

          <p className="user-card-username">@{userData.username}</p>

          {userData.bio && (
            <p className="user-card-bio">{userData.bio}</p>
          )}

          {/* Stats */}
          <div className="user-card-stats">
            <div className="user-card-stat">
              <Users size={16} />
              <span><strong>{userData.followers || 0}</strong> Followers</span>
            </div>
            <div className="user-card-stat">
              <Calendar size={16} />
              <span>Joined {joinDate}</span>
            </div>
            {userData.isStreamer && (
              <div className="user-card-stat streaming">
                <MessageCircle size={16} />
                <span>Streamer</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button className="btn-view-profile" onClick={handleViewProfile}>
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;

