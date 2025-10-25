import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, ExternalLink, Image as ImageIcon } from 'lucide-react';
import './PanelsDisplay.css';

const PanelsDisplay = ({ username }) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPanels();
  }, [username]);

  const fetchPanels = async () => {
    try {
      const response = await axios.get(`/api/panels/${username}`);
      setPanels(response.data.panels || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching panels:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!panels || panels.length === 0) {
    return null;
  }

  // Sort panels by order
  const sortedPanels = [...panels].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="panels-display">
      <div className="panels-display-header">
        <Layout size={20} />
        <h3>About {username}</h3>
      </div>
      <div className="panels-display-grid">
        {sortedPanels.map((panel, index) => (
          <div key={index} className="panel-display-item">
            {panel.imageUrl && (
              <div className="panel-image">
                <img src={panel.imageUrl} alt={panel.title} />
              </div>
            )}
            <div className="panel-content">
              {panel.title && <h4>{panel.title}</h4>}
              {panel.content && <p>{panel.content}</p>}
              {panel.link && (
                <a 
                  href={panel.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="panel-link"
                >
                  <ExternalLink size={14} />
                  Visit Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelsDisplay;

