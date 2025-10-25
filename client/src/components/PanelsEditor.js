import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Save, Plus, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import './PanelsEditor.css';

const PanelsEditor = ({ username }) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const addPanel = () => {
    setPanels([...panels, {
      title: '',
      content: '',
      imageUrl: '',
      link: '',
      order: panels.length
    }]);
  };

  const removePanel = (index) => {
    setPanels(panels.filter((_, i) => i !== index));
  };

  const updatePanel = (index, field, value) => {
    const newPanels = [...panels];
    newPanels[index][field] = value;
    setPanels(newPanels);
  };

  const savePanels = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put('/api/panels', { channelPanels: panels });
      setMessage('✅ Panels saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save panels');
      console.error('Error saving panels:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="panels-loading">Loading panels...</div>;
  }

  return (
    <div className="panels-editor">
      <div className="panels-header">
        <div className="header-left">
          <Layout size={24} />
          <div>
            <h3>Channel Panels</h3>
            <p>Add info panels to your channel page</p>
          </div>
        </div>
        <button className="btn-add" onClick={addPanel}>
          <Plus size={18} />
          Add Panel
        </button>
      </div>

      {panels.length === 0 ? (
        <div className="panels-empty">
          <Layout size={48} />
          <p>No panels yet</p>
          <button className="btn-add-first" onClick={addPanel}>
            <Plus size={18} />
            Create your first panel
          </button>
        </div>
      ) : (
        <div className="panels-list">
          {panels.map((panel, index) => (
            <div key={index} className="panel-editor">
              <div className="panel-header">
                <span className="panel-number">Panel {index + 1}</span>
                <button
                  className="btn-remove"
                  onClick={() => removePanel(index)}
                  title="Remove Panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="panel-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Panel Title</label>
                    <input
                      type="text"
                      value={panel.title}
                      onChange={(e) => updatePanel(index, 'title', e.target.value)}
                      placeholder="About Me, Social Links, etc."
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={panel.content}
                    onChange={(e) => updatePanel(index, 'content', e.target.value)}
                    placeholder="Panel description or information..."
                    maxLength={1000}
                    rows={4}
                  />
                  <small>{panel.content.length}/1000 characters</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <ImageIcon size={16} />
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={panel.imageUrl}
                      onChange={(e) => updatePanel(index, 'imageUrl', e.target.value)}
                      placeholder="https://example.com/image.png"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <LinkIcon size={16} />
                      Link URL (optional)
                    </label>
                    <input
                      type="url"
                      value={panel.link}
                      onChange={(e) => updatePanel(index, 'link', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {panels.length > 0 && (
        <div className="panels-actions">
          <button
            className="btn-save"
            onClick={savePanels}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Panels'}
          </button>
        </div>
      )}

      {message && <div className="panels-message">{message}</div>}
    </div>
  );
};

export default PanelsEditor;

