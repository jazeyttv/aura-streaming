import React from 'react';
import './MaintenancePage.css';

const MaintenancePage = () => {
  return (
    <div className="maintenance-page">
      <div className="maintenance-content">
        <div className="maintenance-icon">
          <div className="gear gear-1">⚙️</div>
          <div className="gear gear-2">⚙️</div>
        </div>
        <h1>🔧 Under Maintenance</h1>
        <p>We're currently performing updates to improve your experience.</p>
        <p className="subtitle">We'll be back shortly!</p>
        <div className="maintenance-footer">
          <p>Thank you for your patience 💙</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

