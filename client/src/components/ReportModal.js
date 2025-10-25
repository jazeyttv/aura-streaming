import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import axios from 'axios';
import './ReportModal.css';

const ReportModal = ({ stream, onClose }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const reasons = [
    'Sexually explicit content',
    'Child Endangerment',
    'Hate speech',
    'Violence',
    'Terrorism',
    'Self-harm',
    'False sensationalism',
    'Doxxing',
    'Fraud and deception',
    'Serious unlawful conduct',
    'Intellectual property violation',
    'Bullying or harassment',
    'Misleading or abusive tags'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setMessage('Please select a reason for reporting');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('/api/reports/submit', {
        streamId: stream._id || stream.id,
        reason: selectedReason,
        additionalInfo
      });

      setMessage(response.data.message);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-modal-title">
            <Flag size={20} />
            <h2>Report livestream by {stream.streamerUsername || stream.streamer?.username}</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="report-section">
            <h3>Reason</h3>
            <div className="report-reasons">
              {reasons.map((reason) => (
                <label key={reason} className="report-reason-item">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="report-section">
            <h3>Additional Information (Optional)</h3>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide any additional context that may help us review this report..."
              rows={4}
              maxLength={500}
            />
            <small>{additionalInfo.length}/500 characters</small>
          </div>

          {message && (
            <div className={`report-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="report-actions">
            <button type="button" className="btn-cancel-report" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-report" disabled={submitting || !selectedReason}>
              {submitting ? 'Submitting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;

