import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './KickLayout.css';

const KickLayout = ({ children, showChat = false }) => {
  return (
    <div className="kick-layout">
      <TopHeader />
      <div className="kick-main-container">
        <Sidebar />
        <div className={`kick-content ${showChat ? 'with-chat' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default KickLayout;

