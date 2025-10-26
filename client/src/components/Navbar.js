import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import { Menu, X, User, LogOut, Video, Settings, ChevronDown, Bell, Users, Check, Trophy } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamInvites, setTeamInvites] = useState([]);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();

      // Connect to Socket.IO for real-time notifications
      socketRef.current = io(config.SOCKET_URL);
      
      socketRef.current.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      const [notifResponse, invitesResponse] = await Promise.all([
        axios.get('/api/notifications'),
        axios.get('/api/teams/invites/pending')
      ]);
      
      setNotifications(notifResponse.data.notifications || []);
      setTeamInvites(invitesResponse.data || []);
      
      // Total unread count includes notifications + team invites
      const notifCount = notifResponse.data.unreadCount || 0;
      const inviteCount = invitesResponse.data.length || 0;
      setUnreadCount(notifCount + inviteCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAcceptInvite = async (teamName) => {
    try {
      await axios.post(`/api/teams/${teamName}/accept`);
      setTeamInvites(teamInvites.filter(inv => inv.teamName !== teamName));
      setUnreadCount(prev => Math.max(0, prev - 1));
      alert(`You have joined the team!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvite = async (teamName) => {
    try {
      await axios.post(`/api/teams/${teamName}/decline`);
      setTeamInvites(teamInvites.filter(inv => inv.teamName !== teamName));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to decline invitation');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="https://i.ibb.co/vC18X7jC/download-3.png" 
            alt="AURA" 
            className="logo-image"
          />
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchBar />
        </div>

        {/* Right Side - Auth Buttons or User Menu */}
        <div className="navbar-right">
          {/* Leaderboard Link (always visible) */}
          <Link to="/leaderboard" className="navbar-leaderboard-link">
            <Trophy size={20} />
            <span>Leaderboard</span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <div className="notifications-wrapper" ref={notifMenuRef}>
                <button 
                  className="notifications-button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      {(notifications.length > 0 || teamInvites.length > 0) && (
                        <div className="notifications-actions">
                          {notifications.length > 0 && (
                            <>
                              <button onClick={markAllAsRead} className="btn-text">
                                Mark all read
                              </button>
                              <button onClick={clearAll} className="btn-text">
                                Clear all
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="notifications-list">
                      {teamInvites.length === 0 && notifications.length === 0 ? (
                        <div className="no-notifications">
                          <Bell size={32} />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        <>
                          {/* Team Invites First */}
                          {teamInvites.map(invite => (
                            <div key={invite.teamName} className="notification-item team-invite unread">
                              <div className="notification-content">
                                <div className="invite-header">
                                  <Users size={16} />
                                  <strong>Team Invitation</strong>
                                </div>
                                <p>{invite.owner?.username} invited you to join <strong>{invite.teamDisplayName}</strong></p>
                                <div className="invite-actions">
                                  <button 
                                    className="btn-accept-invite"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAcceptInvite(invite.teamName);
                                    }}
                                  >
                                    <Check size={14} />
                                    Accept
                                  </button>
                                  <button 
                                    className="btn-decline-invite"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeclineInvite(invite.teamName);
                                    }}
                                  >
                                    <X size={14} />
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Regular Notifications */}
                          {notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                              onClick={() => markAsRead(notif._id)}
                            >
                              <div className="notification-content">
                                <p>{notif.message}</p>
                                <span className="notification-time">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar-small">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{user?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <span className="user-name-nav">{user?.username}</span>
                <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link 
                    to={`/profile/${user?.username}`} 
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Channel</span>
                  </Link>
                  
                  {user?.isStreamer && (
                    <Link 
                      to="/dashboard" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Video size={18} />
                      <span>Creator Dashboard</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Log In
              </Link>
              <Link to="/register" className="btn-signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

