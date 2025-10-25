import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StreamCard from '../components/StreamCard';
import MaintenancePage from '../components/MaintenancePage';
import { TrendingUp, Grid, Heart, Video } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [streams, setStreams] = useState([]);
  const [followedStreams, setFollowedStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarSection, setSidebarSection] = useState('recommended');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    checkMaintenanceMode();
    fetchLiveStreams();
    if (user) {
      fetchFollowedStreams();
    }
    
    // Refresh streams every 5 seconds for faster updates
    const interval = setInterval(() => {
      fetchLiveStreams();
      if (user) fetchFollowedStreams();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const checkMaintenanceMode = async () => {
    try {
      // Make a test request to check if maintenance mode is active
      await axios.get('/api/streams/live');
    } catch (error) {
      if (error.response?.status === 503 && error.response?.data?.maintenance) {
        // Only show maintenance page if user is not admin
        if (!user || user.role !== 'admin') {
          setMaintenanceMode(true);
        }
      }
    }
  };

  const fetchLiveStreams = async () => {
    try {
      const response = await axios.get('/api/streams/live');
      setStreams(response.data);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 503 && error.response?.data?.maintenance) {
        if (!user || user.role !== 'admin') {
          setMaintenanceMode(true);
        }
      }
      console.error('Error fetching streams:', error);
      setLoading(false);
    }
  };

  const fetchFollowedStreams = async () => {
    try {
      const response = await axios.get('/api/users/following/live');
      console.log('🔔 Followed live streams:', response.data.length, response.data);
      setFollowedStreams(response.data);
    } catch (error) {
      console.error('Error fetching followed streams:', error);
    }
  };

  const displayStreams = sidebarSection === 'following' ? followedStreams : streams;

  // Show maintenance page if maintenance mode is active and user is not admin
  if (maintenanceMode && (!user || user.role !== 'admin')) {
    return <MaintenancePage />;
  }

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
      <div className="home-layout">
        {/* Sidebar with live streamers */}
        <aside className="live-sidebar">
          {/* Sidebar Tabs */}
          <div className="sidebar-tabs">
            <button 
              className={`sidebar-tab ${sidebarSection === 'browse' ? 'active' : ''}`}
              onClick={() => setSidebarSection('browse')}
            >
              <Grid size={16} />
              <span>Browse</span>
            </button>
            {user && (
              <button 
                className={`sidebar-tab ${sidebarSection === 'following' ? 'active' : ''}`}
                onClick={() => setSidebarSection('following')}
              >
                <Heart size={16} />
                <span>Following</span>
              </button>
            )}
            <button 
              className={`sidebar-tab ${sidebarSection === 'recommended' ? 'active' : ''}`}
              onClick={() => setSidebarSection('recommended')}
            >
              <TrendingUp size={16} />
              <span>Recommended</span>
            </button>
          </div>
          
          <div className="sidebar-streamers">
            {displayStreams.slice(0, 10).map((stream) => {
              const username = stream.streamer?.username || stream.streamerUsername;
              const displayName = stream.streamer?.displayName || username;
              const avatar = stream.streamer?.avatar;
              
              return (
                <div 
                  key={stream._id || stream.id} 
                  className="sidebar-streamer"
                  onClick={() => window.location.href = `/stream/${stream._id || stream.id}`}
                >
                  <div className="streamer-avatar">
                    {avatar ? (
                      <img src={avatar} alt={username} className="avatar-circle" />
                    ) : (
                      <div className="avatar-circle">
                        {username?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                    <span className="live-pulse"></span>
                  </div>
                  <div className="streamer-info">
                    <span className="streamer-name">{displayName}</span>
                    <span className="streamer-game">{stream.category}</span>
                  </div>
                  <div className="viewer-count">
                    <span className="red-dot"></span>
                    {stream.viewerCount || 0}
                  </div>
                </div>
              );
            })}
            
            {displayStreams.length === 0 && (
              <div className="no-streamers">
                <p>{sidebarSection === 'following' ? 'No followed channels are live' : 'No one is live right now'}</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="home-main">
          <div className="streams-header">
            <h2>Live Channels</h2>
          </div>

          {streams.length === 0 ? (
            <div className="no-streams-modern">
              <Video size={64} className="empty-icon" />
              <h3>No live streams</h3>
              <p>Be the first to go live and grow your community!</p>
            </div>
          ) : (
            <div className="streams-grid-kick">
              {streams.map((stream) => (
                <StreamCard key={stream.id || stream._id} stream={stream} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;

