import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Video, Eye, Shield, Ban, UserCheck, Crown, CheckCircle, Key, Copy, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  
  // Dynamically determine RTMP URL from API_URL
  const getRtmpUrl = () => {
    try {
      const url = new URL(API_URL);
      return `rtmp://${url.hostname}:1935/live`;
    } catch {
      return 'rtmp://localhost:1935/live';
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
      console.log('📋 Admin received users:', response.data.length);
      console.log('🔑 First user sample:', {
        username: response.data[0]?.username,
        isStreamer: response.data[0]?.isStreamer,
        hasStreamKey: !!response.data[0]?.streamKey,
        streamKey: response.data[0]?.streamKey ? response.data[0].streamKey.substring(0, 15) + '...' : null
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to update role');
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

  const handleTogglePartner = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove' : 'add';
    if (!window.confirm(`${action === 'add' ? 'Add' : 'Remove'} partner status?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/partner`, {
        isPartner: !currentStatus
      });
      await fetchUsers();
      alert(`Partner status ${action === 'add' ? 'added' : 'removed'} successfully!`);
    } catch (error) {
      console.error('Error toggling partner status:', error);
      alert('Failed to update partner status');
    }
  };

  const handleToggleAffiliate = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove' : 'add';
    if (!window.confirm(`${action === 'add' ? 'Add' : 'Remove'} affiliate status?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/affiliate`, {
        isAffiliate: !currentStatus
      });
      await fetchUsers();
      alert(`Affiliate status ${action === 'add' ? 'added' : 'removed'} successfully!`);
    } catch (error) {
      console.error('Error toggling affiliate status:', error);
      alert('Failed to update affiliate status');
    }
  };

  const handleResetStreamKey = async (userId, username) => {
    if (!window.confirm(`Reset stream key for ${username}? This will invalidate their current key.`)) return;

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

  const handleViewStreamKey = (streamKey, username) => {
    setSelectedKey({ streamKey, username });
    setShowKeyModal(true);
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
          <h2>User Management</h2>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Stream Key</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u._id} className={u.isBanned ? 'banned-user' : ''}>
                    <td>
                      <strong>{u.username}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                      {u.isStreamer && u.streamKey ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="btn-action key"
                            onClick={() => handleViewStreamKey(u.streamKey, u.username)}
                            title="View Stream Key"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn-action reset-key"
                            onClick={() => handleResetStreamKey(u.id || u._id, u.username)}
                            title="Reset Stream Key"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      ) : u.isStreamer ? (
                        <button
                          className="btn-action reset-key"
                          onClick={() => handleResetStreamKey(u.id || u._id, u.username)}
                          title="Generate Stream Key"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Generate
                        </button>
                      ) : (
                        <button
                          className="btn-action make-streamer"
                          onClick={() => handleMakeStreamer(u.id || u._id, u.username)}
                          title="Make Streamer"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <Video size={12} /> Make
                        </button>
                      )}
                    </td>
                    <td>
                      {u.isBanned ? (
                        <span className="status-banned">Banned</span>
                      ) : (
                        <span className="status-active">Active</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {u.role !== 'admin' && (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id || u._id, e.target.value)}
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        
                        {/* Partner button - available for all users */}
                        <button
                          className={`btn-action partner ${u.isPartner ? 'active' : ''}`}
                          onClick={() => handleTogglePartner(u.id || u._id, u.isPartner)}
                          title={u.isPartner ? "Remove Partner" : "Make Partner"}
                        >
                          <CheckCircle size={16} />
                        </button>
                        
                        {/* Affiliate button - available for all users */}
                        <button
                          className={`btn-action affiliate ${u.isAffiliate ? 'active' : ''}`}
                          onClick={() => handleToggleAffiliate(u.id || u._id, u.isAffiliate)}
                          title={u.isAffiliate ? "Remove Affiliate" : "Make Affiliate"}
                        >
                          A
                        </button>
                        
                        {!u.isBanned && u.role !== 'admin' && (
                          <button
                            className="btn-action ban"
                            onClick={() => handleBanUser(u.id || u._id)}
                            title="Ban User"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        
                        {u.isBanned && (
                          <button
                            className="btn-action unban"
                            onClick={() => handleUnbanUser(u.id || u._id)}
                            title="Unban User"
                          >
                            <UserCheck size={16} />
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

        {/* Stream Key Modal */}
        {showKeyModal && selectedKey && (
          <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><Key size={20} /> Stream Key for {selectedKey.username}</h3>
                <button className="modal-close" onClick={() => setShowKeyModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="key-section">
                  <label>RTMP Server:</label>
                  <div className="key-display">
                    <code>{rtmpUrl}</code>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopyToClipboard(rtmpUrl)}
                      title="Copy RTMP URL"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="key-section">
                  <label>Stream Key:</label>
                  <div className="key-display">
                    <code>{selectedKey.streamKey}</code>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopyToClipboard(selectedKey.streamKey)}
                      title="Copy Stream Key"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="key-info">
                  <p><strong>⚠️ Security Warning:</strong></p>
                  <ul>
                    <li>Never share this stream key publicly</li>
                    <li>Anyone with this key can stream to this account</li>
                    <li>Reset the key if it's been compromised</li>
                  </ul>
                </div>

                <div className="key-info">
                  <p><strong>📡 OBS Setup Instructions:</strong></p>
                  <ol>
                    <li>Open OBS Studio → Settings → Stream</li>
                    <li>Service: <strong>Custom</strong></li>
                    <li>Server: <code>{rtmpUrl}</code></li>
                    <li>Stream Key: <code>{selectedKey.streamKey}</code></li>
                    <li>Click <strong>OK</strong> and start streaming!</li>
                  </ol>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowKeyModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

