import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Crown, X, UserPlus, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import './TeamManager.css';

const TeamManager = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [uploading, setUploading] = useState({ banner: false, logo: false });

  const [teamData, setTeamData] = useState({
    name: '',
    displayName: '',
    description: '',
    banner: '',
    logo: ''
  });

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const fetchMyTeam = async () => {
    try {
      const response = await axios.get('/api/teams/my-team');
      if (response.data.team) {
        setTeam(response.data.team);
        setTeamData({
          name: response.data.team.name,
          displayName: response.data.team.displayName,
          description: response.data.team.description || '',
          banner: response.data.team.banner || '',
          logo: response.data.team.logo || ''
        });
      }
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setTeam(null);
      }
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/teams/create', teamData);
      setTeam(response.data.team);
      setMessage('Team created successfully!');
      setShowCreateForm(false);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(`/api/teams/${team.name}`, {
        displayName: teamData.displayName,
        description: teamData.description,
        banner: teamData.banner,
        logo: teamData.logo
      });
      setTeam(response.data.team);
      setMessage('Team updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      await axios.post(`/api/teams/${team.name}/invite`, { username: inviteUsername });
      setMessage(`Invitation sent to ${inviteUsername}!`);
      setInviteUsername('');
      await fetchMyTeam(); // Refresh team data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberUsername) => {
    if (!window.confirm(`Remove ${memberUsername} from the team?`)) return;

    setLoading(true);
    setMessage('');

    try {
      await axios.post(`/api/teams/${team.name}/remove-member`, { userId: memberId });
      setMessage(`${memberUsername} removed from team`);
      await fetchMyTeam();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async (userId) => {
    setLoading(true);
    setMessage('');

    try {
      await axios.post(`/api/teams/${team.name}/cancel-invite`, { userId });
      setMessage('Invitation cancelled');
      await fetchMyTeam();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to cancel invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading({ ...uploading, [type]: true });

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post(`/api/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTeamData({ ...teamData, [type]: response.data.url });
      setMessage(`${type === 'banner' ? 'Banner' : 'Logo'} uploaded!`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Delete your team? This cannot be undone!')) return;

    setLoading(true);
    setMessage('');

    try {
      await axios.delete(`/api/teams/${team.name}`);
      setMessage('Team deleted');
      setTeam(null);
      setTeamData({ name: '', displayName: '', description: '', banner: '', logo: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isPartner && !user?.isAffiliate) {
    return (
      <div className="team-manager">
        <div className="partner-required">
          <Crown size={48} />
          <h3>Partner or Affiliate Status Required</h3>
          <p>Only verified partners and affiliates can create and manage teams.</p>
        </div>
      </div>
    );
  }

  if (loading && !team) {
    return <div className="team-manager"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="team-manager">
      {message && (
        <div className={`team-message ${message.includes('success') || message.includes('sent') || message.includes('created') || message.includes('updated') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {!team && !showCreateForm && (
        <div className="no-team">
          <Users size={48} />
          <h3>You don't have a team yet</h3>
          <p>Create a team to collaborate with other streamers and build your community together.</p>
          <button className="btn-create-team" onClick={() => setShowCreateForm(true)}>
            <UserPlus size={18} />
            Create Team
          </button>
        </div>
      )}

      {!team && showCreateForm && (
        <div className="team-form">
          <div className="form-header">
            <h3>Create Your Team</h3>
            <button className="btn-close" onClick={() => setShowCreateForm(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateTeam}>
            <div className="form-group">
              <label>Team Name (URL)</label>
              <input
                type="text"
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                placeholder="team-name"
                pattern="[a-zA-Z0-9_\-]+"
                minLength={3}
                maxLength={30}
                required
              />
              <small>Letters, numbers, hyphens, and underscores only (3-30 characters)</small>
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={teamData.displayName}
                onChange={(e) => setTeamData({ ...teamData, displayName: e.target.value })}
                placeholder="Team Display Name"
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                placeholder="Tell viewers about your team..."
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Banner Image</label>
              <div className="upload-section">
                <input
                  type="text"
                  value={teamData.banner}
                  onChange={(e) => setTeamData({ ...teamData, banner: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
                <div className="upload-or">OR</div>
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="banner-upload" className="btn-upload">
                  {uploading.banner ? 'Uploading...' : 'Upload Banner'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Logo Image</label>
              <div className="upload-section">
                <input
                  type="text"
                  value={teamData.logo}
                  onChange={(e) => setTeamData({ ...teamData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <div className="upload-or">OR</div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload" className="btn-upload">
                  {uploading.logo ? 'Uploading...' : 'Upload Logo'}
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>
      )}

      {team && (
        <div className="team-details">
          <div className="team-header">
            <h3>
              <Users size={24} />
              {team.displayName}
            </h3>
            <a href={`/team/${team.name}`} target="_blank" rel="noopener noreferrer" className="btn-view-team">
              <ExternalLink size={16} />
              View Team Page
            </a>
          </div>

          <form onSubmit={handleUpdateTeam} className="team-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={teamData.displayName}
                onChange={(e) => setTeamData({ ...teamData, displayName: e.target.value })}
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                placeholder="Tell viewers about your team..."
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Banner Image</label>
              <div className="upload-section">
                <input
                  type="text"
                  value={teamData.banner}
                  onChange={(e) => setTeamData({ ...teamData, banner: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
                <div className="upload-or">OR</div>
                <input
                  type="file"
                  id="banner-upload-edit"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="banner-upload-edit" className="btn-upload">
                  {uploading.banner ? 'Uploading...' : 'Upload Banner'}
                </label>
                {teamData.banner && (
                  <div className="image-preview-small">
                    <img src={teamData.banner} alt="Banner" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Logo Image</label>
              <div className="upload-section">
                <input
                  type="text"
                  value={teamData.logo}
                  onChange={(e) => setTeamData({ ...teamData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <div className="upload-or">OR</div>
                <input
                  type="file"
                  id="logo-upload-edit"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload-edit" className="btn-upload">
                  {uploading.logo ? 'Uploading...' : 'Upload Logo'}
                </label>
                {teamData.logo && (
                  <div className="image-preview-small">
                    <img src={teamData.logo} alt="Logo" />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Team'}
            </button>
          </form>

          <div className="team-members-section">
            <h4>Team Members ({team.members?.length || 0})</h4>
            <div className="members-list">
              {team.members?.map(member => (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    {member.avatar && <img src={member.avatar} alt={member.username} className="member-avatar" />}
                    <div>
                      <div className="member-name">
                        {member.username}
                        {member._id === team.owner._id && <Crown size={14} className="owner-icon" />}
                      </div>
                      {member.isPartner && <span className="partner-badge-small">Partner</span>}
                    </div>
                  </div>
                  {member._id !== team.owner._id && (
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveMember(member._id, member.username)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="team-invites-section">
            <h4>Invite Members</h4>
            <form onSubmit={handleInviteMember} className="invite-form">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Username to invite"
                required
              />
              <button type="submit" disabled={loading}>
                <UserPlus size={16} />
                Invite
              </button>
            </form>

            {team.pendingInvites?.length > 0 && (
              <div className="pending-invites">
                <h5>Pending Invites</h5>
                {team.pendingInvites.map(invite => (
                  <div key={invite.userId._id} className="invite-item">
                    <span>{invite.userId.username}</span>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelInvite(invite.userId._id)}
                      disabled={loading}
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <button className="btn-delete" onClick={handleDeleteTeam} disabled={loading}>
              <Trash2 size={16} />
              Delete Team
            </button>
            <small>This action cannot be undone. All members will be removed.</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;

