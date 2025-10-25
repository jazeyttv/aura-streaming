import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Video, Eye, Shield, Ban, UserCheck, Crown, CheckCircle, Key, Copy, RefreshCw, Trash2, MessageCircle, X, Search, Info } from 'lucide-react';
import { API_URL } from '../config';
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
      alert(`✅ ${username} is now a ${newRole}!`);
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role');
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
    if (!window.confirm(`🚫 IP BAN ${username}?\n\nThis will:\n- Ban ALL their IP addresses\n- Block them from accessing the entire site\n- Persist even after refresh\n\nThis is a SITE-WIDE ban!`)) return;

    try {
      const response = await axios.post(`/api/admin/users/${userId}/ip-ban`);
      await fetchUsers();
      alert(`✅ ${username} is now IP BANNED!\n\nBanned IPs:\n${response.data.bannedIPs?.join('\n') || 'Unknown'}`);
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
      alert(`✅ ${username} is now IP UNBANNED!\n\nUnbanned IPs:\n${response.data.unbannedIPs?.join('\n') || 'Unknown'}`);
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

        {/* Users Management */}
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
                            🚫
                          </button>
                        )}

                        {u.isIpBanned && (
                          <button
                            className="btn-action ip-unban"
                            onClick={() => handleIpUnban(u.id || u._id, u.username)}
                            title="Remove IP Ban"
                          >
                            ✅
                          </button>
                        )}

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
                  <span>{selectedUser.isStreamer ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Partner:</strong>
                  <span>{selectedUser.isPartner ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Affiliate:</strong>
                  <span>{selectedUser.isAffiliate ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Banned:</strong>
                  <span>{selectedUser.isBanned ? '🚫 Yes' : '✅ No'}</span>
                </div>
                <div className="detail-row">
                  <strong>Chat Banned:</strong>
                  <span>{selectedUser.isChatBanned ? '🚫 Yes' : '✅ No'}</span>
                </div>
                <div className="detail-row">
                  <strong>IP Banned:</strong>
                  <span>{selectedUser.isIpBanned ? '🚫 Yes (SITE-WIDE)' : '✅ No'}</span>
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
    </div>
  );
};

export default Admin;
