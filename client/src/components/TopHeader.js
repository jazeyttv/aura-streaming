import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TopHeader.css';

const TopHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="kick-header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          <span className="logo-text">AURA</span>
        </Link>
      </div>

      <div className="header-center">
        <form onSubmit={handleSearch} className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      <div className="header-right">
        {user ? (
          <>
            <button className="header-icon-btn">
              <Bell size={20} />
            </button>
            
            <div className="header-user-menu">
              <button 
                className="header-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="header-avatar" />
                ) : (
                  <div className="header-avatar-placeholder">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to={`/profile/${user.username}`} className="dropdown-item">
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <Settings size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="header-auth-buttons">
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-signup">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopHeader;

