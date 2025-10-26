import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Users, TrendingUp, Clock, Star, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Following', path: '/following' },
    { icon: Compass, label: 'Browse', path: '/browse' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="kick-sidebar">
      <div className="sidebar-content">
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <Users size={16} />
            <span>FOLLOWED CHANNELS</span>
          </div>
          <div className="sidebar-followed">
            <div className="sidebar-empty-state">
              Follow channels to see them here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

