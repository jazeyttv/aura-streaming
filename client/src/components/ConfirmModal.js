import React, { useState } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm', 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireInput = false,
  inputPlaceholder = '',
  inputLabel = '',
  confirmButtonClass = 'btn-primary',
  danger = false
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireInput) {
      onConfirm(inputValue);
      setInputValue('');
    } else {
      onConfirm();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (!requireInput || inputValue.trim())) {
      handleConfirm();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="confirm-modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
          
          {requireInput && (
            <div className="confirm-modal-input-group">
              {inputLabel && <label>{inputLabel}</label>}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputPlaceholder}
                autoFocus
                className="confirm-modal-input"
              />
            </div>
          )}
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="btn-secondary" 
            onClick={handleClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${danger ? 'btn-danger' : confirmButtonClass}`}
            onClick={handleConfirm}
            disabled={requireInput && !inputValue.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

