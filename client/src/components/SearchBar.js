import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Video, CheckCircle, Users, Shield, Crown } from 'lucide-react';
import './SearchBar.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], streams: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults({ users: [], streams: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleStreamClick = (streamId) => {
    navigate(`/stream/${streamId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults({ users: [], streams: [] });
    setShowResults(false);
  };

  const hasResults = searchResults.users.length > 0 || searchResults.streams.length > 0;

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={handleClear}>
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results-dropdown">
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : hasResults ? (
            <>
              {/* Users Section */}
              {searchResults.users.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <Users size={16} />
                    <span>Channels</span>
                  </div>
                  {searchResults.users.map((user) => (
                    <div
                      key={user._id}
                      className="search-result-item"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <div className="search-user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="search-user-info">
                        <div className="search-user-name">
                          {user.displayName || user.username}
                          <div className="search-badges">
                            {user.isPartner && (
                              <CheckCircle 
                                className="partner-badge-search" 
                                size={16} 
                                fill="#00d9ff"
                                color="#00d9ff"
                                title="Verified Partner"
                              />
                            )}
                            {user.isAffiliate && (
                              <span className="affiliate-badge-search" title="Affiliate">A</span>
                            )}
                            {user.role === 'admin' && (
                              <Crown 
                                className="admin-badge-search" 
                                size={16}
                                color="#ff4444"
                                title="Administrator"
                              />
                            )}
                            {user.role === 'moderator' && (
                              <Shield 
                                className="mod-badge-search" 
                                size={16}
                                color="#4444ff"
                                title="Moderator"
                              />
                            )}
                          </div>
                        </div>
                        <div className="search-user-meta">
                          {user.username} • {user.followerCount || 0} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Streams Section */}
              {searchResults.streams.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <Video size={16} />
                    <span>Live Channels</span>
                  </div>
                  {searchResults.streams.map((stream) => (
                    <div
                      key={stream._id}
                      className="search-result-item search-stream-item"
                      onClick={() => handleStreamClick(stream._id)}
                    >
                      <div className="search-stream-badge">LIVE</div>
                      <div className="search-user-avatar">
                        {stream.streamer?.avatar ? (
                          <img src={stream.streamer.avatar} alt={stream.streamer.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {stream.streamer?.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="search-user-info">
                        <div className="search-user-name">
                          {stream.streamer?.displayName || stream.streamer?.username}
                          {stream.streamer?.isPartner && (
                            <CheckCircle 
                              className="partner-badge-search" 
                              size={16} 
                              fill="#00d9ff"
                              color="#00d9ff"
                            />
                          )}
                        </div>
                        <div className="search-stream-title">{stream.title}</div>
                        <div className="search-user-meta">
                          {stream.category} • {stream.viewerCount || 0} viewers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="search-no-results">
              No results for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

