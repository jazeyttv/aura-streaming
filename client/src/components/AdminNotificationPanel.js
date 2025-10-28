import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './AdminNotificationPanel.css';

const AdminNotificationPanel = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [duration, setDuration] = useState(0); // 0 = no expiry
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/announcements/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.announcements) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!message.trim()) {
      setError('Please enter a message');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/announcements`,
        { message, type, duration: parseInt(duration) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('✓ Announcement sent to all users!');
      setMessage('');
      setDuration(0);
      
      // Reload announcements
      loadAnnouncements();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to remove this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnnouncements(prev => prev.filter(a => 
        (a._id !== announcementId) && (a.id !== announcementId)
      ));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const quickMessages = [
    { text: 'All stream keys have been reset', type: 'warning' },
    { text: 'Server maintenance scheduled for tonight', type: 'warning' },
    { text: 'New features are now live!', type: 'success' },
    { text: 'Welcome to the platform!', type: 'info' },
    { text: 'Please update your password for security', type: 'warning' },
  ];

  return (
    <div className="admin-notification-panel">
      <h3>📢 Send System Announcement</h3>
      
      <form onSubmit={handleSubmit} className="announcement-form">
        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your announcement message..."
            rows={3}
            maxLength={500}
            required
          />
          <small>{message.length}/500 characters</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="info">ℹ Info (Purple)</option>
              <option value="success">✓ Success (Green)</option>
              <option value="warning">⚠ Warning (Pink)</option>
              <option value="error">✕ Error (Orange)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration:</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="0">Permanent (until dismissed)</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="180">3 hours</option>
              <option value="1440">24 hours</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" disabled={loading} className="btn-send">
          {loading ? 'Sending...' : '📢 Broadcast Announcement'}
        </button>
      </form>

      <div className="quick-messages">
        <h4>Quick Messages:</h4>
        <div className="quick-message-buttons">
          {quickMessages.map((qm, index) => (
            <button
              key={index}
              type="button"
              className={`quick-msg-btn quick-msg-${qm.type}`}
              onClick={() => {
                setMessage(qm.text);
                setType(qm.type);
              }}
            >
              {qm.text}
            </button>
          ))}
        </div>
      </div>

      <div className="announcements-history">
        <h4>Recent Announcements ({announcements.length})</h4>
        {announcements.length === 0 ? (
          <p className="no-announcements">No announcements yet.</p>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => {
              const id = announcement._id || announcement.id;
              const isActive = announcement.active;
              const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
              
              return (
                <div key={id} className={`announcement-item ${!isActive ? 'inactive' : ''}`}>
                  <div className="announcement-header">
                    <span className={`announcement-type-badge badge-${announcement.type}`}>
                      {announcement.type}
                    </span>
                    <span className="announcement-status">
                      {!isActive && '🔴 Inactive'}
                      {isActive && !isExpired && '🟢 Active'}
                      {isActive && isExpired && '⏰ Expired'}
                    </span>
                  </div>
                  <p className="announcement-message">{announcement.message}</p>
                  <div className="announcement-meta">
                    <small>By: {announcement.createdByUsername}</small>
                    <small>Created: {formatDate(announcement.createdAt)}</small>
                    {announcement.expiresAt && (
                      <small>Expires: {formatDate(announcement.expiresAt)}</small>
                    )}
                  </div>
                  {isActive && (
                    <button 
                      onClick={() => handleDelete(id)}
                      className="btn-delete-announcement"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationPanel;

