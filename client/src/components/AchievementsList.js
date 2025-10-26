import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Lock } from 'lucide-react';
import './AchievementsList.css';

const AchievementsList = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    fetchAchievements();
    fetchAllDefinitions();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const endpoint = userId ? `/api/achievements/user/${userId}` : '/api/achievements/my-achievements';
      const response = await axios.get(endpoint);
      setAchievements(response.data.achievements || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setLoading(false);
    }
  };

  const fetchAllDefinitions = async () => {
    try {
      const response = await axios.get('/api/achievements/definitions');
      setAllAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievement definitions:', error);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#9B59B6';
      case 'rare':
        return '#3498DB';
      case 'common':
      default:
        return '#95A5A6';
    }
  };

  const unlockedIds = achievements.map(a => a.achievementId);
  
  const filteredAchievements = Object.values(allAchievements).filter(def => {
    const isUnlocked = unlockedIds.includes(def.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  if (loading) {
    return (
      <div className="achievements-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>
          <Trophy size={24} />
          Achievements
        </h2>
        <div className="achievements-progress">
          {achievements.length} / {Object.keys(allAchievements).length} Unlocked
        </div>
      </div>

      <div className="achievements-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
          onClick={() => setFilter('unlocked')}
        >
          Unlocked
        </button>
        <button 
          className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
          onClick={() => setFilter('locked')}
        >
          Locked
        </button>
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map((def) => {
          const unlocked = achievements.find(a => a.achievementId === def.id);
          const isUnlocked = !!unlocked;

          return (
            <div 
              key={def.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} rarity-${def.rarity}`}
              style={{
                borderColor: isUnlocked ? getRarityColor(def.rarity) : '#2a2a2f'
              }}
            >
              <div className="achievement-icon">
                {isUnlocked ? (
                  <span className="achievement-emoji">{def.icon}</span>
                ) : (
                  <Lock size={32} className="lock-icon" />
                )}
              </div>
              <div className="achievement-info">
                <h3 className="achievement-name">{def.name}</h3>
                <p className="achievement-description">{def.description}</p>
                <div className="achievement-meta">
                  <span 
                    className="achievement-rarity"
                    style={{ color: getRarityColor(def.rarity) }}
                  >
                    {def.rarity.toUpperCase()}
                  </span>
                  {isUnlocked && unlocked.unlockedAt && (
                    <span className="achievement-date">
                      {new Date(unlocked.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsList;

