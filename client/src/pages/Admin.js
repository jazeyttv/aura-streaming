import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Video, Eye, Shield, Ban, UserCheck, Crown, CheckCircle, Key, Copy, RefreshCw, Trash2, MessageCircle, X, Search, Info, Award, Flag, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config';
import { getAllBadges } from '../config/badges';
import AdminNotificationPanel from '../components/AdminNotificationPanel';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStreamers: 0,
    liveStreams: 0,
    totalViewers: 0
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedUserForBadges, setSelectedUserForBadges] = useState(null);
  const [availableBadges] = useState(getAllBadges());
  const [tempBadgeSelection, setTempBadgeSelection] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' });
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Dynamically determine RTMP URL from API_URL
  const getRtmpUrl = () => {
    try {
      const url = new URL(API_URL);
      return `rtmp://${url.hostname}:1935/live`;
    } catch {
      return 'rtmp://72.23.212.188:1935/live';
    }
  };
  const [rtmpUrl] = useState(getRtmpUrl());

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
    fetchUsers();
    fetchMaintenanceStatus();
    fetchReports();
  }, [user, navigate]);

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterType !== 'all') {
      if (filterType === 'streamer') {
        filtered = filtered.filter(u => u.isStreamer);
      } else if (filterType === 'viewer') {
        filtered = filtered.filter(u => !u.isStreamer);
      } else if (filterType === 'partner') {
        filtered = filtered.filter(u => u.isPartner);
      } else if (filterType === 'affiliate') {
        filtered = filtered.filter(u => u.isAffiliate);
      } else if (filterType === 'banned') {
        filtered = filtered.filter(u => u.isBanned);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterType]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await axios.get('/api/maintenance/status');
      setMaintenanceMode({
        enabled: response.data.enabled || false,
        message: response.data.message || '🔧 Website is currently under maintenance. Please check back soon!'
      });
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      // Set default values if fetch fails
      setMaintenanceMode({
        enabled: false,
        message: '🔧 Website is currently under maintenance. Please check back soon!'
      });
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/api/reports/admin/all?status=${reportFilter}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports();
    }
  }, [reportFilter]);

  const handleAcceptReport = async (reportId) => {
    if (!window.confirm('Accept this report and delete the stream?')) return;

    try {
      await axios.post(`/api/reports/admin/${reportId}/accept`, { adminNotes });
      alert('Report accepted and stream removed');
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept report');
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!window.confirm('Reject this report?')) return;

    try {
      await axios.post(`/api/reports/admin/${reportId}/reject`, { adminNotes });
      alert('Report rejected');
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject report');
    }
  };

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const response = await axios.post('/api/maintenance/toggle', {
        enabled: !maintenanceMode.enabled,
        message: maintenanceMode.message
      });
      setMaintenanceMode({
        enabled: response.data.enabled,
        message: response.data.message
      });
      alert(`Maintenance mode ${response.data.enabled ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
      alert('Failed to toggle maintenance mode');
    }
    setMaintenanceLoading(false);
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Ban reason (optional):');
    if (reason === null) return;

    try {
      await axios.post(`/api/admin/users/${userId}/ban`, {
        reason,
        duration: 0 // permanent
      });
      await fetchUsers();
      alert('User banned successfully!');
    } catch (error) {
      console.error('Error banning user:', error);
      alert(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Unban this user?')) return;

    try {
      await axios.post(`/api/admin/users/${userId}/unban`);
      await fetchUsers();
      alert('User unbanned successfully!');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
  };

  const handleGlobalUnban = async (userId, username) => {
    if (!window.confirm(`Unban ${username} from ALL streams?\n\nThis will remove them from all stream-specific bans.`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/global-unban`);
      await fetchUsers();
      alert(`${username} unbanned from ${response.data.unbannedFromStreams} streams!`);
    } catch (error) {
      console.error('Error globally unbanning user:', error);
      alert('Failed to globally unban user');
    }
  };

  const handleChatBan = async (userId) => {
    const reason = prompt('Chat ban reason (optional):');
    if (reason === null) return;

    try {
      await axios.post(`/api/admin/users/${userId}/chat-ban`, {
        reason,
        duration: 0 // permanent
      });
      await fetchUsers();
      alert('User chat banned successfully!');
    } catch (error) {
      console.error('Error chat banning user:', error);
      alert(error.response?.data?.message || 'Failed to chat ban user');
    }
  };

  const handleChatUnban = async (userId) => {
    if (!window.confirm('Remove chat ban from this user?')) return;

    try {
      await axios.post(`/api/admin/users/${userId}/chat-unban`);
      await fetchUsers();
      alert('User chat unbanned successfully!');
    } catch (error) {
      console.error('Error chat unbanning user:', error);
      alert('Failed to chat unban user');
    }
  };

  const handleChangeRole = async (userId, username, newRole) => {
    if (username === 'Jazey' && newRole !== 'admin') {
      alert('Cannot change the main admin role!');
      return;
    }
    
    if (!window.confirm(`Change ${username}'s role to ${newRole.toUpperCase()}?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      alert(`${username} is now a ${newRole}!`);
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role');
    }
  };

  const handleChangeUsername = async (userId, currentUsername) => {
    const newUsername = prompt(`Change username for ${currentUsername}\n\nNew username (3-20 characters, letters/numbers/_):`);
    
    if (!newUsername) return;
    if (newUsername === currentUsername) {
      alert('New username is the same as current username');
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      alert('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      alert('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!window.confirm(`Change username from "${currentUsername}" to "${newUsername}"?\n\nThis will affect all references to this user.`)) return;

    try {
      const response = await axios.put(`/api/users/admin/change-username/${userId}`, { newUsername });
      await fetchUsers();
      alert(response.data.message || 'Username changed successfully!');
    } catch (error) {
      console.error('Error changing username:', error);
      alert(error.response?.data?.message || 'Failed to change username');
    }
  };

  const handleTogglePartner = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove partner status from' : 'make partner';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/partner`, {
        isPartner: !currentStatus
      });
      await fetchUsers();
      alert(`User ${currentStatus ? 'removed from' : 'added to'} partner program!`);
    } catch (error) {
      console.error('Error toggling partner:', error);
      alert('Failed to update partner status');
    }
  };

  const handleToggleAffiliate = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove affiliate status from' : 'make affiliate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/affiliate`, {
        isAffiliate: !currentStatus
      });
      await fetchUsers();
      alert(`User ${currentStatus ? 'removed from' : 'added to'} affiliate program!`);
    } catch (error) {
      console.error('Error toggling affiliate:', error);
      alert('Failed to update affiliate status');
    }
  };

  const handleOpenBadgeModal = (user) => {
    setSelectedUserForBadges(user);
    setTempBadgeSelection(user.customBadges || []); // Initialize temp selection with current badges
    setShowBadgeModal(true);
  };

  const handleToggleBadgeTemp = (badgeId) => {
    // Toggle badge in temporary selection (not saved yet)
    if (tempBadgeSelection.includes(badgeId)) {
      setTempBadgeSelection(tempBadgeSelection.filter(id => id !== badgeId));
    } else {
      setTempBadgeSelection([...tempBadgeSelection, badgeId]);
    }
  };

  const handleSaveBadges = async () => {
    if (!selectedUserForBadges) return;

    try {
      const response = await axios.post(`/api/admin/users/${selectedUserForBadges.id || selectedUserForBadges._id}/badges`, {
        badgeIds: tempBadgeSelection
      });
      
      // Update the selected user with the new badge data from response
      if (response.data.customBadges !== undefined) {
        setSelectedUserForBadges({
          ...selectedUserForBadges,
          customBadges: response.data.customBadges
        });
      }
      
      await fetchUsers();
      setShowBadgeModal(false);
      alert(`✨ Badges updated for ${selectedUserForBadges.username}! Assigned ${tempBadgeSelection.length} badge(s).`);
      console.log(`✨ Badges saved for ${selectedUserForBadges.username}:`, tempBadgeSelection);
    } catch (error) {
      console.error('Error saving badges:', error);
      alert('Failed to save badges. Please try again.');
    }
  };

  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setTempBadgeSelection([]);
    setSelectedUserForBadges(null);
  };

  const handleToggleStreaming = async (userId, username, currentStatus) => {
    const action = currentStatus ? 'disable streaming for' : 'enable streaming for';
    if (!window.confirm(`Are you sure you want to ${action} ${username}?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/streaming-access`, {
        canStream: !currentStatus
      });
      await fetchUsers();
      alert(`Streaming ${currentStatus ? 'disabled' : 'enabled'} for ${username}!`);
    } catch (error) {
      console.error('Error toggling streaming:', error);
      alert('Failed to update streaming access');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`⚠️ DELETE USER "${username}"?\n\nThis will permanently delete:\n- User account\n- All streams\n- All data\n\nThis CANNOT be undone!`)) return;
    
    const confirmation = prompt('Type the username to confirm deletion:');
    if (confirmation !== username) {
      alert('Username did not match. Deletion cancelled.');
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      await fetchUsers();
      await fetchStats();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetStreamKey = async (userId, username) => {
    if (!window.confirm(`Reset stream key for ${username}? This will end any active stream.`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/reset-key`);
      await fetchUsers();
      setSelectedKey({ streamKey: response.data.streamKey, username: response.data.username });
      setShowKeyModal(true);
      alert('Stream key reset successfully! Show the user their new key.');
    } catch (error) {
      console.error('Error resetting stream key:', error);
      alert(error.response?.data?.message || 'Failed to reset stream key');
    }
  };

  const handleIpBan = async (userId, username) => {
    if (!window.confirm(`IP BAN ${username}?\n\nThis will:\n- Ban ALL their IP addresses\n- Block them from accessing the entire site\n- Persist even after refresh\n\nThis is a SITE-WIDE ban!`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/ip-ban`);
      await fetchUsers();
      alert(`${username} is now IP BANNED!\n\nBanned IPs:\n${response.data.bannedIPs?.join('\n') || 'Unknown'}`);
    } catch (error) {
      console.error('Error IP banning user:', error);
      alert(error.response?.data?.message || 'Failed to IP ban user');
    }
  };

  const handleIpUnban = async (userId, username) => {
    if (!window.confirm(`Remove IP ban from ${username}?`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/ip-unban`);
      await fetchUsers();
      alert(`${username} is now IP UNBANNED!\n\nUnbanned IPs:\n${response.data.unbannedIPs?.join('\n') || 'Unknown'}`);
    } catch (error) {
      console.error('Error IP unbanning user:', error);
      alert(error.response?.data?.message || 'Failed to IP unban user');
    }
  };

  const handleViewStreamKey = (streamKey, username) => {
    setSelectedKey({ streamKey, username });
    setShowKeyModal(true);
  };

  const handleViewUserDetails = (u) => {
    setSelectedUser(u);
    setShowUserModal(true);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please copy manually.');
    });
  };

  const handleMakeStreamer = async (userId, username) => {
    if (!window.confirm(`Make ${username} a streamer? This will generate a stream key for them.`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/make-streamer`);
      await fetchUsers();
      setSelectedKey({ streamKey: response.data.streamKey, username: response.data.username });
      setShowKeyModal(true);
      alert('User is now a streamer! Show them their new stream key.');
    } catch (error) {
      console.error('Error making streamer:', error);
      alert(error.response?.data?.message || 'Failed to make user a streamer');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="role-badge admin"><Crown size={12} /> ADMIN</span>;
      case 'moderator':
        return <span className="role-badge moderator"><Shield size={12} /> MOD</span>;
      default:
        return <span className="role-badge user">USER</span>;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform Management & Statistics</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={32} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon streamers">
              <Video size={32} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalStreamers}</h3>
              <p>Streamers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon live">
              <Video size={32} />
            </div>
            <div className="stat-content">
              <h3>{stats.liveStreams}</h3>
              <p>Live Streams</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon viewers">
              <Eye size={32} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalViewers}</h3>
              <p>Current Viewers</p>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="admin-section maintenance-section">
          <div className="section-header">
            <h2>🔧 Website Maintenance</h2>
            <button 
              className={`btn-maintenance ${maintenanceMode.enabled ? 'active' : ''}`}
              onClick={toggleMaintenance}
              disabled={maintenanceLoading}
            >
              {maintenanceLoading ? '⏳ Processing...' : maintenanceMode.enabled ? '🔴 DISABLE Maintenance' : '🟢 ENABLE Maintenance'}
            </button>
          </div>
          
          {maintenanceMode.enabled && (
            <div className="maintenance-warning">
              ⚠️ <strong>MAINTENANCE MODE ACTIVE!</strong> Website is locked. Only admins can access.
            </div>
          )}
        </div>

        {/* System Announcements */}
        <AdminNotificationPanel />

        {/* Users Management */}
        {/* Reports Management */}
        <div className="admin-section">
          <div className="section-header">
            <h2><Flag size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Stream Reports</h2>
            <select 
              className="filter-select"
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="reports-list">
            {reports.length === 0 ? (
              <div className="no-data">
                <AlertTriangle size={48} />
                <p>No {reportFilter !== 'all' ? reportFilter : ''} reports found</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report._id} className={`report-card status-${report.status}`}>
                  <div className="report-header">
                    <div className="report-info">
                      <span className={`report-status ${report.status}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className="report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="report-reason">{report.reason}</span>
                  </div>

                  <div className="report-body">
                    <div className="report-detail">
                      <strong>Stream:</strong> {report.stream?.title || 'Deleted'} ({report.stream?.category || 'N/A'})
                    </div>
                    <div className="report-detail">
                      <strong>Streamer:</strong> {report.streamer?.username || 'Unknown'}
                    </div>
                    <div className="report-detail">
                      <strong>Reported by:</strong> {report.reportedBy?.username || 'Unknown'}
                    </div>
                    {report.additionalInfo && (
                      <div className="report-detail">
                        <strong>Additional Info:</strong> {report.additionalInfo}
                      </div>
                    )}
                    {report.reviewedBy && (
                      <div className="report-detail">
                        <strong>Reviewed by:</strong> {report.reviewedBy.username} on {new Date(report.reviewedAt).toLocaleDateString()}
                      </div>
                    )}
                    {report.adminNotes && (
                      <div className="report-detail">
                        <strong>Admin Notes:</strong> {report.adminNotes}
                      </div>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="report-actions">
                      <button
                        className="btn-action-view"
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes('');
                        }}
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header">
            <h2>User Management</h2>
            <div className="filters">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
                <option value="user">Users</option>
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="all">All Types</option>
                <option value="streamer">Streamers</option>
                <option value="viewer">Viewers</option>
                <option value="partner">Partners</option>
                <option value="affiliate">Affiliates</option>
                <option value="banned">Banned</option>
              </select>
              <div className="filter-results">
                {filteredUsers.length} / {users.length} users
              </div>
            </div>
          </div>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className={u.isBanned ? 'banned-user' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{u.username}</strong>
                        <button
                          className="btn-icon-small"
                          onClick={() => handleViewUserDetails(u)}
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="role-dropdown"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id || u._id, u.username, e.target.value)}
                        disabled={u.username === 'Jazey'} // Prevent changing main admin
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {u.isStreamer ? (
                          <span className="badge-streamer">Streamer</span>
                        ) : (
                          <span className="badge-viewer">Viewer</span>
                        )}
                        {u.isPartner && (
                          <span className="badge-partner-small" title="Partner">
                            <CheckCircle size={14} />
                          </span>
                        )}
                        {u.isAffiliate && (
                          <span className="badge-affiliate-small" title="Affiliate">
                            A
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {u.isBanned ? (
                        <span className="status-banned">Banned</span>
                      ) : u.isChatBanned ? (
                        <span className="status-chat-banned">Chat Banned</span>
                      ) : (
                        <span className="status-active">Active</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {/* Streaming Access */}
                        {u.role !== 'admin' && (
                          <button
                            className={`btn-action streaming ${u.isStreamer ? 'active' : 'disabled'}`}
                            onClick={() => handleToggleStreaming(u.id || u._id, u.username, u.isStreamer)}
                            title={u.isStreamer ? "Disable Streaming" : "Enable Streaming"}
                          >
                            <Video size={14} />
                          </button>
                        )}

                        {/* Partner */}
                        <button
                          className={`btn-action partner ${u.isPartner ? 'active' : ''}`}
                          onClick={() => handleTogglePartner(u.id || u._id, u.isPartner)}
                          title={u.isPartner ? "Remove Partner" : "Make Partner"}
                        >
                          <CheckCircle size={14} />
                        </button>
                        
                        {/* Affiliate */}
                        <button
                          className={`btn-action affiliate ${u.isAffiliate ? 'active' : ''}`}
                          onClick={() => handleToggleAffiliate(u.id || u._id, u.isAffiliate)}
                          title={u.isAffiliate ? "Remove Affiliate" : "Make Affiliate"}
                        >
                          A
                        </button>

                        {/* Custom Badges */}
                        <button
                          className={`btn-action badges ${(u.customBadges && u.customBadges.length > 0) ? 'active' : ''}`}
                          onClick={() => handleOpenBadgeModal(u)}
                          title="Manage Custom Badges"
                        >
                          <Award size={14} />
                        </button>

                        {/* Change Username */}
                        <button
                          className="btn-action username"
                          onClick={() => handleChangeUsername(u.id || u._id, u.username)}
                          title="Change Username"
                        >
                          <Key size={14} />
                        </button>

                        {/* Chat Ban */}
                        {!u.isChatBanned && u.role !== 'admin' && (
                          <button
                            className="btn-action chat-ban"
                            onClick={() => handleChatBan(u.id || u._id)}
                            title="Chat Ban"
                          >
                            <MessageCircle size={14} />
                          </button>
                        )}

                        {u.isChatBanned && (
                          <button
                            className="btn-action chat-unban"
                            onClick={() => handleChatUnban(u.id || u._id)}
                            title="Remove Chat Ban"
                          >
                            <MessageCircle size={14} />
                          </button>
                        )}
                        
                        {/* Ban/Unban */}
                        {!u.isBanned && u.role !== 'admin' && (
                          <button
                            className="btn-action ban"
                            onClick={() => handleBanUser(u.id || u._id)}
                            title="Ban User"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        
                        {u.isBanned && (
                          <button
                            className="btn-action unban"
                            onClick={() => handleUnbanUser(u.id || u._id)}
                            title="Unban User"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}

                        {/* IP Ban/Unban */}
                        {u.role !== 'admin' && !u.isIpBanned && (
                          <button
                            className="btn-action ip-ban"
                            onClick={() => handleIpBan(u.id || u._id, u.username)}
                            title="IP Ban (Site-Wide)"
                          >
                            <Ban size={14} />
                          </button>
                        )}

                        {u.isIpBanned && (
                          <button
                            className="btn-action ip-unban"
                            onClick={() => handleIpUnban(u.id || u._id, u.username)}
                            title="Remove IP Ban"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}

                        {/* Global Stream Unban */}
                        <button
                          className="btn-action global-unban"
                          onClick={() => handleGlobalUnban(u.id || u._id, u.username)}
                          title="Unban from ALL Streams"
                        >
                          <Shield size={14} />
                        </button>

                        {/* Delete User */}
                        {u.role !== 'admin' && (
                          <button
                            className="btn-action delete"
                            onClick={() => handleDeleteUser(u.id || u._id, u.username)}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stream Key Modal */}
      {showKeyModal && selectedKey && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Stream Key for {selectedKey.username}</h2>
              <button className="btn-close" onClick={() => setShowKeyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="stream-key-display">
                <div className="key-section">
                  <label>RTMP Server URL:</label>
                  <div className="key-value">
                    <code>{rtmpUrl}</code>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopyToClipboard(rtmpUrl)}
                    >
                      <Copy size={16} /> Copy
                    </button>
                  </div>
                </div>
                <div className="key-section">
                  <label>Stream Key:</label>
                  <div className="key-value">
                    <code>{selectedKey.streamKey}</code>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopyToClipboard(selectedKey.streamKey)}
                    >
                      <Copy size={16} /> Copy
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-warning">
                ⚠️ Keep this key private! Anyone with this key can stream to this account.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details: {selectedUser.username}</h2>
              <button className="btn-close" onClick={() => setShowUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <strong>User ID:</strong>
                  <span>{selectedUser.id || selectedUser._id}</span>
                </div>
                <div className="detail-row">
                  <strong>Username:</strong>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="detail-row">
                  <strong>Email:</strong>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <strong>Role:</strong>
                  <span>{getRoleBadge(selectedUser.role)}</span>
                </div>
                <div className="detail-row">
                  <strong>Can Stream:</strong>
                  <span>{selectedUser.isStreamer ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Partner:</strong>
                  <span>{selectedUser.isPartner ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Affiliate:</strong>
                  <span>{selectedUser.isAffiliate ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Banned:</strong>
                  <span>{selectedUser.isBanned ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Chat Banned:</strong>
                  <span>{selectedUser.isChatBanned ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>IP Banned:</strong>
                  <span>{selectedUser.isIpBanned ? 'Yes (SITE-WIDE)' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Current IP:</strong>
                  <span>{selectedUser.ipAddress || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <strong>Last IP:</strong>
                  <span>{selectedUser.lastIpAddress || 'Unknown'}</span>
                </div>
                {selectedUser.streamKey && (
                  <div className="detail-row">
                    <strong>Stream Key:</strong>
                    <button
                      className="btn-action key"
                      onClick={() => {
                        setShowUserModal(false);
                        handleViewStreamKey(selectedUser.streamKey, selectedUser.username);
                      }}
                    >
                      <Eye size={14} /> View Key
                    </button>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Joined:</strong>
                  <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content report-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Flag size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Review Report
              </h2>
              <button className="btn-close" onClick={() => setSelectedReport(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="report-review-section">
                <h3>Report Details</h3>
                <div className="report-detail-full">
                  <strong>Reason:</strong> {selectedReport.reason}
                </div>
                <div className="report-detail-full">
                  <strong>Stream:</strong> {selectedReport.stream?.title || 'Deleted'} - {selectedReport.stream?.category || 'N/A'}
                </div>
                <div className="report-detail-full">
                  <strong>Streamer:</strong> {selectedReport.streamer?.username}
                </div>
                <div className="report-detail-full">
                  <strong>Reported by:</strong> {selectedReport.reportedBy?.username}
                </div>
                <div className="report-detail-full">
                  <strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
                {selectedReport.additionalInfo && (
                  <div className="report-detail-full">
                    <strong>Additional Information:</strong>
                    <p style={{ marginTop: '8px', color: '#ccc' }}>{selectedReport.additionalInfo}</p>
                  </div>
                )}
              </div>

              <div className="report-review-section">
                <h3>Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision (optional)..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleAcceptReport(selectedReport._id)}
                >
                  <CheckCircle size={16} />
                  Accept Report & Delete Stream
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleRejectReport(selectedReport._id)}
                >
                  <X size={16} />
                  Reject Report
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Management Modal */}
      {showBadgeModal && selectedUserForBadges && (
        <div className="modal-overlay" onClick={handleCloseBadgeModal}>
          <div className="modal-content badge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Award size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Manage Badges: {selectedUserForBadges.username}
              </h2>
              <button className="btn-close" onClick={handleCloseBadgeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#aaa' }}>
                Click badges to assign/remove them. User can select ONE badge to display at a time.
              </p>
              <div className="badge-grid">
                {availableBadges.map((badge) => {
                  const isAssigned = tempBadgeSelection.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`badge-item ${isAssigned ? 'assigned' : ''}`}
                      onClick={() => handleToggleBadgeTemp(badge.id)}
                      title={badge.description}
                    >
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="badge-image"
                      />
                      <div className="badge-info">
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-desc">{badge.description}</div>
                      </div>
                      {isAssigned && (
                        <div className="badge-check">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="badge-summary">
                <strong>Selected Badges:</strong> {tempBadgeSelection.length} / {availableBadges.length}
              </div>
              <div className="badge-actions">
                <button className="btn btn-secondary" onClick={handleCloseBadgeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveBadges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
