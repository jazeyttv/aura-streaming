import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Coins, TrendingUp } from 'lucide-react';
import './PointsDisplay.css';

const PointsDisplay = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPoints();
    }
  }, [user]);

  const fetchPoints = async () => {
    try {
      const response = await axios.get('/api/points');
      setPoints(response.data.points || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching points:', error);
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  return (
    <div className="points-display">
      <div className="points-icon">
        <Coins size={20} />
      </div>
      <div className="points-info">
        <div className="points-value">{points.toLocaleString()}</div>
        <div className="points-label">Channel Points</div>
      </div>
      <div className="points-trend">
        <TrendingUp size={16} />
      </div>
    </div>
  );
};

export default PointsDisplay;

