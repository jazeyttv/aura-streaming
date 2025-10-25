import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import { Menu, X, User, LogOut, Video, Settings, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="https://i.ibb.co/vC18X7jC/download-3.png" 
            alt="AURA" 
            className="logo-image"
          />
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchBar />
        </div>

        {/* Right Side - Auth Buttons or User Menu */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar-small">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="user-name-nav">{user?.username}</span>
                <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link 
                    to={`/profile/${user?.username}`} 
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Channel</span>
                  </Link>
                  
                  {user?.isStreamer && (
                    <Link 
                      to="/dashboard" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Video size={18} />
                      <span>Creator Dashboard</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Log In
              </Link>
              <Link to="/register" className="btn-signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

