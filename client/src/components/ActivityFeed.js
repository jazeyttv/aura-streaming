import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Trophy, TrendingUp, UserPlus, Play, CheckCircle, Star } from 'lucide-react';
import './ActivityFeed.css';

const ActivityFeed = ({ userId, limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const endpoint = userId 
        ? `/api/stats/activity/${userId}?limit=${limit}`
        : `/api/stats/activity?limit=${limit}`;
      const response = await axios.get(endpoint);
      setActivities(response.data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'achievement_unlocked':
        return <Trophy size={18} />;
      case 'level_up':
        return <TrendingUp size={18} />;
      case 'followed':
        return <UserPlus size={18} />;
      case 'stream_started':
        return <Play size={18} />;
      case 'became_partner':
        return <CheckCircle size={18} />;
      case 'became_affiliate':
        return <Star size={18} />;
      case 'joined':
        return <UserPlus size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-feed-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed-empty">
        <Activity size={48} />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h3>
          <Activity size={20} />
          Recent Activity
        </h3>
      </div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className={`activity-icon activity-type-${activity.activityType}`}>
              {getActivityIcon(activity.activityType)}
            </div>
            <div className="activity-content">
              <div className="activity-text">{activity.activityText}</div>
              {activity.activityData?.achievementIcon && (
                <span className="activity-achievement-icon">
                  {activity.activityData.achievementIcon}
                </span>
              )}
            </div>
            <div className="activity-time">{formatTimeAgo(activity.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;

