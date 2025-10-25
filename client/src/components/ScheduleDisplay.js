import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar } from 'lucide-react';
import './ScheduleDisplay.css';

const DAYS_MAP = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const ScheduleDisplay = ({ username }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [username]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`/api/schedule/${username}`);
      setSchedule(response.data.schedule || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return null;
  }

  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Filter enabled slots
  const enabledSchedule = schedule.filter(slot => slot.enabled);

  if (enabledSchedule.length === 0) {
    return null;
  }

  return (
    <div className="schedule-display">
      <div className="schedule-display-header">
        <Calendar size={20} />
        <h3>Stream Schedule</h3>
      </div>
      <div className="schedule-display-list">
        {enabledSchedule.map((slot, index) => (
          <div key={index} className="schedule-display-item">
            <div className="schedule-day">
              <Clock size={16} />
              <span>{DAYS_MAP[slot.day]}</span>
            </div>
            <div className="schedule-time">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay;

