import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import io from 'socket.io-client';
import './NotificationBar.css';

const NotificationBar = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    // Load announcements
    loadAnnouncements();

    // Load dismissed announcements from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    setDismissedIds(new Set(dismissed));

    // Connect to Socket.IO for real-time announcements
    const socket = io(API_URL);

    socket.on('system-announcement', (announcement) => {
      console.log('📢 New announcement received:', announcement);
      setAnnouncements(prev => {
        // Check if announcement already exists
        const exists = prev.some(a => a._id === announcement._id || a.id === announcement.id);
        if (exists) return prev;
        return [announcement, ...prev];
      });
    });

    socket.on('announcement-removed', ({ announcementId }) => {
      console.log('🗑️ Announcement removed:', announcementId);
      setAnnouncements(prev => prev.filter(a => 
        (a._id?.toString() !== announcementId?.toString()) && 
        (a.id?.toString() !== announcementId?.toString())
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.announcements) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const dismissAnnouncement = (announcementId) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(announcementId);
    setDismissedIds(newDismissed);
    
    // Save to localStorage
    localStorage.setItem('dismissedAnnouncements', JSON.stringify([...newDismissed]));
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  // Filter out dismissed and inactive announcements
  const visibleAnnouncements = announcements.filter(announcement => {
    const id = announcement._id || announcement.id;
    if (dismissedIds.has(id)) return false;
    if (!announcement.active) return false;
    
    // Check expiration
    if (announcement.expiresAt) {
      const expiryDate = new Date(announcement.expiresAt);
      if (expiryDate < new Date()) return false;
    }
    
    return true;
  });

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="notification-bar-container">
      {visibleAnnouncements.map((announcement) => {
        const id = announcement._id || announcement.id;
        const type = announcement.type || 'info';
        
        return (
          <div key={id} className={`notification-bar notification-bar-${type}`}>
            <div className="notification-bar-content">
              <span className="notification-bar-icon">{getAnnouncementIcon(type)}</span>
              <span className="notification-bar-message">{announcement.message}</span>
              {announcement.createdByUsername && (
                <span className="notification-bar-author">— {announcement.createdByUsername}</span>
              )}
            </div>
            <button 
              className="notification-bar-close"
              onClick={() => dismissAnnouncement(id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBar;

