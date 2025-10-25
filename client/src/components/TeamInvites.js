import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Check, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamInvites.css';

const TeamInvites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    try {
      const response = await axios.get('/api/teams/invites/pending');
      setInvites(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team invites:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (teamName) => {
    setProcessing(teamName);
    try {
      await axios.post(`/api/teams/${teamName}/accept`);
      setInvites(invites.filter(inv => inv.teamName !== teamName));
      alert(`You have joined the team!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (teamName) => {
    setProcessing(teamName);
    try {
      await axios.post(`/api/teams/${teamName}/decline`);
      setInvites(invites.filter(inv => inv.teamName !== teamName));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to decline invitation');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="team-invites-container">
        <div className="loading-invites">Loading invites...</div>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="team-invites-container">
        <div className="no-invites">
          <Bell size={32} />
          <p>No team invitations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-invites-container">
      <h3 className="invites-header">
        <Users size={20} />
        Team Invitations ({invites.length})
      </h3>
      
      <div className="invites-list">
        {invites.map(invite => (
          <div key={invite.teamName} className="invite-card">
            <div className="invite-info">
              <div className="team-logo">
                {invite.teamLogo ? (
                  <img src={invite.teamLogo} alt={invite.teamDisplayName} />
                ) : (
                  <Users size={24} />
                )}
              </div>
              <div className="invite-details">
                <h4>{invite.teamDisplayName}</h4>
                <p className="invite-owner">
                  Invited by <strong>{invite.owner?.username}</strong>
                </p>
              </div>
            </div>
            
            <div className="invite-actions">
              <button
                className="btn-accept"
                onClick={() => handleAccept(invite.teamName)}
                disabled={processing === invite.teamName}
              >
                <Check size={16} />
                Accept
              </button>
              <button
                className="btn-decline"
                onClick={() => handleDecline(invite.teamName)}
                disabled={processing === invite.teamName}
              >
                <X size={16} />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamInvites;

