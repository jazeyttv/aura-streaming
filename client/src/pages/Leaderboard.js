import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, TrendingUp, Clock, Award, Crown, Medal } from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('level'); // level, points, watchTime

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/stats/leaderboard?type=${activeTab}&limit=100`);
      setLeaderboard(response.data.leaderboard || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={24} color="#FFD700" />;
    if (index === 1) return <Medal size={24} color="#C0C0C0" />;
    if (index === 2) return <Medal size={24} color="#CD7F32" />;
    return <span className="rank-number">#{index + 1}</span>;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  const getStatValue = (stats) => {
    switch (activeTab) {
      case 'level':
        return `Level ${stats.level}`;
      case 'points':
        return `${stats.totalPointsEarned.toLocaleString()} pts`;
      case 'watchTime':
        const hours = Math.floor(stats.watchTimeMinutes / 60);
        return `${hours.toLocaleString()} hours`;
      default:
        return '';
    }
  };

  return (
    <div className="page-container leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="header-content">
            <Trophy size={48} />
            <h1>Leaderboard</h1>
            <p>Compete with the best streamers and viewers!</p>
          </div>
        </div>

        <div className="leaderboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => setActiveTab('level')}
          >
            <Award size={20} />
            Top Level
          </button>
          <button
            className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
            onClick={() => setActiveTab('points')}
          >
            <TrendingUp size={20} />
            Top Points
          </button>
          <button
            className={`tab-btn ${activeTab === 'watchTime' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchTime')}
          >
            <Clock size={20} />
            Top Watch Time
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <Trophy size={64} />
                <p>No data yet. Be the first!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`leaderboard-item ${getRankClass(index)}`}
                  onClick={() => navigate(`/profile/${entry.userId?.username}`)}
                >
                  <div className="rank-badge">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="user-info">
                    <div className="user-avatar">
                      {entry.userId?.avatar ? (
                        <img src={entry.userId.avatar} alt={entry.userId.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {entry.userId?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="username">
                        {entry.userId?.displayName || entry.userId?.username || 'Unknown User'}
                        {entry.userId?.isPartner && (
                          <span className="partner-badge" title="Partner">✓</span>
                        )}
                      </div>
                      <div className="user-role">{entry.userId?.role || 'user'}</div>
                    </div>
                  </div>

                  <div className="user-stats">
                    <div className="stat-primary">{getStatValue(entry)}</div>
                    <div className="stat-secondary">
                      {activeTab === 'level' && `${entry.xp.toLocaleString()} XP`}
                      {activeTab === 'points' && `Level ${entry.level}`}
                      {activeTab === 'watchTime' && `${entry.messagesSent.toLocaleString()} messages`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

