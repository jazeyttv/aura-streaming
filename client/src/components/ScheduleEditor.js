import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Save, Plus, X } from 'lucide-react';
import './ScheduleEditor.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ScheduleEditor = ({ username }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const addScheduleSlot = () => {
    setSchedule([...schedule, {
      day: 'monday',
      startTime: '18:00',
      endTime: '22:00',
      enabled: true
    }]);
  };

  const removeScheduleSlot = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const saveSchedule = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put('/api/schedule', { streamSchedule: schedule });
      setMessage('✅ Schedule saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save schedule');
      console.error('Error saving schedule:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="schedule-loading">Loading schedule...</div>;
  }

  return (
    <div className="schedule-editor">
      <div className="schedule-header">
        <div className="header-left">
          <Clock size={24} />
          <div>
            <h3>Stream Schedule</h3>
            <p>Let your viewers know when you'll be live</p>
          </div>
        </div>
        <button className="btn-add" onClick={addScheduleSlot}>
          <Plus size={18} />
          Add Time Slot
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="schedule-empty">
          <Clock size={48} />
          <p>No schedule set</p>
          <button className="btn-add-first" onClick={addScheduleSlot}>
            <Plus size={18} />
            Add your first time slot
          </button>
        </div>
      ) : (
        <div className="schedule-list">
          {schedule.map((slot, index) => (
            <div key={index} className="schedule-slot">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(e) => updateScheduleSlot(index, 'enabled', e.target.checked)}
                className="schedule-checkbox"
              />
              <select
                value={slot.day}
                onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                className="schedule-select"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                className="schedule-time"
              />
              <span className="time-separator">to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                className="schedule-time"
              />
              <button
                className="btn-remove"
                onClick={() => removeScheduleSlot(index)}
                title="Remove"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {schedule.length > 0 && (
        <div className="schedule-actions">
          <button
            className="btn-save"
            onClick={saveSchedule}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      )}

      {message && <div className="schedule-message">{message}</div>}
    </div>
  );
};

export default ScheduleEditor;

