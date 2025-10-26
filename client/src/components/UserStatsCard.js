import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Clock, MessageCircle, Zap, Award, Flame } from 'lucide-react';
import './UserStatsCard.css';

const UserStatsCard = ({ userId, isOwnProfile }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const endpoint = isOwnProfile ? '/api/stats/my-stats' : `/api/stats/user/${userId}`;
      const response = await axios.get(endpoint);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const calculateXPForNextLevel = (level) => {
    // XP needed for next level: (level)^2 * 100
    return level * level * 100;
  };

  const getXPProgress = () => {
    if (!stats) return 0;
    const xpForCurrentLevel = (stats.level - 1) * (stats.level - 1) * 100;
    const xpForNextLevel = calculateXPForNextLevel(stats.level);
    const xpInCurrentLevel = stats.xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return (xpInCurrentLevel / xpNeededForLevel) * 100;
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="user-stats-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const xpProgress = getXPProgress();
  const xpForNext = calculateXPForNextLevel(stats.level);

  return (
    <div className="user-stats-card">
      <div className="stats-header">
        <h2>
          <TrendingUp size={24} />
          User Stats
        </h2>
      </div>

      <div className="stats-level-section">
        <div className="level-badge">
          <Award size={32} />
          <span className="level-number">{stats.level}</span>
        </div>
        <div className="level-info">
          <div className="level-title">Level {stats.level}</div>
          <div className="xp-bar-container">
            <div className="xp-bar" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <div className="xp-text">
            {stats.xp} / {xpForNext} XP
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {isOwnProfile && (
          <div className="stat-item">
            <div className="stat-icon">
              <Zap size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.points.toLocaleString()}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>
        )}

        <div className="stat-item">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatTime(stats.watchTimeMinutes)}</div>
            <div className="stat-label">Watch Time</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <MessageCircle size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.messagesSent.toLocaleString()}</div>
            <div className="stat-label">Messages Sent</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Flame size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.loginStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="stats-footer">
          <div className="total-points">
            Total Points Earned: <strong>{stats.totalPointsEarned.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatsCard;

