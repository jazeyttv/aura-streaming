import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, Shield, CheckCircle } from 'lucide-react';
import './TeamPage.css';

const TeamPage = () => {
  const { teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, [teamName]);

  const fetchTeam = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamName}`);
      setTeam(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="team-page">
        <div className="loading">Loading team...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-page">
        <div className="team-not-found">
          <h2>Team Not Found</h2>
          <p>The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      {/* Team Banner */}
      <div className="team-banner" style={{ backgroundImage: team.banner ? `url(${team.banner})` : 'none' }}>
        <div className="team-banner-overlay">
          <div className="team-header-content">
            {team.logo && (
              <div className="team-logo">
                <img src={team.logo} alt={team.displayName} />
              </div>
            )}
            <div className="team-info">
              <h1 className="team-display-name">{team.displayName}</h1>
              <div className="team-stats">
                <span className="team-stat">
                  <Users size={16} />
                  {team.members.length} Members
                </span>
                <span className="team-stat">
                  <Calendar size={16} />
                  Est. {new Date(team.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Description */}
      {team.description && (
        <div className="team-section">
          <h2>About {team.displayName}</h2>
          <p className="team-description">{team.description}</p>
        </div>
      )}

      {/* Team Members */}
      <div className="team-section">
        <h2>Team Members ({team.members.length})</h2>
        <div className="team-members-grid">
          {team.members.map(member => (
            <Link
              key={member._id}
              to={`/profile/${member.username}`}
              className="team-member-card"
            >
              <div className="member-avatar">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.username} />
                ) : (
                  <div className="member-avatar-placeholder">
                    {member.username[0].toUpperCase()}
                  </div>
                )}
                {member._id === team.owner._id && (
                  <div className="member-owner-badge" title="Team Owner">
                    <Shield size={12} />
                  </div>
                )}
              </div>
              <div className="member-info">
                <div className="member-name">
                  {member.username}
                  {member.isPartner && (
                    <CheckCircle size={14} className="partner-badge-small" />
                  )}
                </div>
                {member.displayName && member.displayName !== member.username && (
                  <div className="member-display-name">{member.displayName}</div>
                )}
                {member.followers !== undefined && (
                  <div className="member-followers">{member.followers} followers</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;

