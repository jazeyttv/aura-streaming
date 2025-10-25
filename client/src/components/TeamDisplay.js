import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users } from 'lucide-react';
import './TeamDisplay.css';

const TeamDisplay = ({ username }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTeams();
  }, [username]);

  const fetchUserTeams = async () => {
    try {
      // Fetch all teams and filter by member
      const response = await axios.get('/api/teams');
      const userTeams = response.data.filter(team => 
        team.members.some(member => member.username === username)
      );
      setTeams(userTeams);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user teams:', error);
      setLoading(false);
    }
  };

  if (loading || teams.length === 0) {
    return null;
  }

  return (
    <div className="team-display">
      <div className="team-display-header">
        <Users size={20} />
        <h3>Teams</h3>
      </div>
      <div className="team-display-list">
        {teams.map(team => (
          <Link
            key={team._id}
            to={`/team/${team.name}`}
            className="team-display-item"
          >
            <div className="team-item-banner" style={{ backgroundImage: team.banner ? `url(${team.banner})` : 'none' }}>
              {team.logo && (
                <div className="team-item-logo">
                  <img src={team.logo} alt={team.displayName} />
                </div>
              )}
            </div>
            <div className="team-item-info">
              <div className="team-item-name">{team.displayName}</div>
              <div className="team-item-members">
                {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeamDisplay;

