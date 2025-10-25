import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, X, Save, AlertTriangle, Shield, Clock, Target,
  Palette
} from 'lucide-react';
import axios from 'axios';
import './ChannelActions.css';

const ChannelActions = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState('banned-words');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Banned Words
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');

  // Moderation Settings
  const [moderation, setModeration] = useState({
    sexualContent: 'unfiltered',
    hateSpeech: 'maximum',
    violence: 'unfiltered',
    bullying: 'unfiltered',
    drugs: 'unfiltered',
    weapons: 'unfiltered',
    gibberish: false,
    spam: false
  });

  // Slow Mode
  const [slowMode, setSlowMode] = useState({
    enabled: false,
    duration: 0
  });

  // Follower Goal
  const [followerGoal, setFollowerGoal] = useState('');

  // Chat Color
  const [chatColor, setChatColor] = useState('#FFFFFF');

  // Chat Modes
  const [chatSettings, setChatSettings] = useState({
    followerOnly: false,
    followerOnlyDuration: 0,
    subscriberOnly: false,
    emotesOnly: false
  });

  const colors = [
    '#FFE4C4', '#FFA500', '#FFC300', '#FFB6C1', '#FF69B4', '#FF0000', '#C8A2C8', '#9B59B6',
    '#87CEEB', '#4169E1', '#0000FF', '#90EE90', '#00FF00', '#00CED1', '#00FFFF', '#FF1493'
  ];

  useEffect(() => {
    if (!user || !user.isStreamer) {
      navigate('/');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/channel-settings');
      setBannedWords(response.data.bannedWords || []);
      setModeration(response.data.moderationSettings || moderation);
      setSlowMode(response.data.slowMode || { enabled: false, duration: 0 });
      setFollowerGoal(response.data.followerGoal || '');
      setChatColor(response.data.chatColor || user.chatColor || '#FFFFFF');
      
      // Fetch chat settings
      const chatResponse = await axios.get(`/api/chat-settings/${user.username}`);
      setChatSettings(chatResponse.data.chatSettings || {
        followerOnly: false,
        followerOnlyDuration: 0,
        subscriberOnly: false,
        emotesOnly: false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const addBannedWord = async () => {
    if (!newWord.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/channel-settings/banned-words', { word: newWord });
      setBannedWords(response.data.bannedWords);
      setNewWord('');
      setMessage('✅ Word banned successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Failed to ban word');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const removeBannedWord = async (word) => {
    try {
      const response = await axios.delete(`/api/channel-settings/banned-words/${word}`);
      setBannedWords(response.data.bannedWords);
      setMessage('✅ Word removed');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to remove word');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const saveModerationSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/api/channel-settings/moderation', { moderationSettings: moderation });
      setMessage('✅ Moderation settings saved');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const saveSlowMode = async (newSettings) => {
    try {
      await axios.put('/api/channel-settings/slow-mode', newSettings);
      setSlowMode(newSettings);
      setMessage('✅ Slow mode updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update slow mode');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const saveFollowerGoal = async () => {
    setLoading(true);
    try {
      const goal = followerGoal === '' ? null : parseInt(followerGoal);
      await axios.put('/api/channel-settings/follower-goal', { goal });
      setMessage('✅ Follower goal updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update goal');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const saveChatColor = async (color) => {
    try {
      const response = await axios.put('/api/channel-settings/chat-color', { color });
      setChatColor(color);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage('✅ Chat color updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update color');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const saveChatSettings = async (newSettings) => {
    try {
      await axios.put('/api/chat-settings', { chatSettings: newSettings });
      setChatSettings(newSettings);
      setMessage('✅ Chat settings updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update chat settings');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="page-container">
      <div className="channel-actions-container">
        <div className="channel-actions-header">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Channel Actions</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="channel-actions-nav">
          <button 
            className={activeSection === 'banned-words' ? 'active' : ''}
            onClick={() => setActiveSection('banned-words')}
          >
            <AlertTriangle size={18} />
            Banned Words
          </button>
          <button 
            className={activeSection === 'moderation' ? 'active' : ''}
            onClick={() => setActiveSection('moderation')}
          >
            <Shield size={18} />
            AI Moderation
          </button>
          <button 
            className={activeSection === 'slow-mode' ? 'active' : ''}
            onClick={() => setActiveSection('slow-mode')}
          >
            <Clock size={18} />
            Slow Mode
          </button>
          <button 
            className={activeSection === 'goals' ? 'active' : ''}
            onClick={() => setActiveSection('goals')}
          >
            <Target size={18} />
            Set Goals
          </button>
          <button 
            className={activeSection === 'identity' ? 'active' : ''}
            onClick={() => setActiveSection('identity')}
          >
            <Palette size={18} />
            Identity
          </button>
        </div>

        <div className="channel-actions-content">
          {activeSection === 'banned-words' && (
            <div className="section">
              <h2>Banned Words</h2>
              <p className="section-description">Enter words you want to automatically filter from your chat</p>
              
              <div className="input-group">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBannedWord()}
                  placeholder="Enter a word you wish to ban"
                />
                <button onClick={addBannedWord} className="btn-add" disabled={loading}>
                  <Plus size={20} />
                </button>
              </div>

              <div className="banned-words-list">
                {bannedWords.map((word, index) => (
                  <div key={index} className="banned-word-item">
                    <span>{word}</span>
                    <button onClick={() => removeBannedWord(word)} className="btn-remove">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {bannedWords.length === 0 && (
                  <p className="empty-state">No banned words yet</p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'moderation' && (
            <div className="section">
              <h2>AI Moderation <span className="badge-new">NEW</span></h2>
              <p className="section-description">
                AI Moderation uses machine learning to find potentially harmful or unwanted messages. 
                Some words will never be allowed regardless of settings below.
              </p>

              <div className="moderation-settings">
                {[
                  { key: 'sexualContent', label: 'Sexual content', desc: "If it relates to sex, sexuality or nudity in any way, I'm ready to have people discuss it around me." },
                  { key: 'hateSpeech', label: 'Hate speech', desc: "I'd like to avoid seeing content if it includes any stereotypes, reclaimed slurs, hateful ideologies, or suggests the rights of protected groups are immoral." },
                  { key: 'violence', label: 'Violence', desc: "I'm open to conversations around violence even if it calls for violence, destruction of property, military action or talks about self-harm." },
                  { key: 'bullying', label: 'Bullying', desc: "I'm willing to engage in conversations which include racial or ableist slurs, encourage self-harm and suggest violent threats." },
                  { key: 'drugs', label: 'Drugs', desc: 'Conversations that describe buying, using and distributing addictive and recreational drugs are okay with me.' },
                  { key: 'weapons', label: 'Weapons', desc: "I'm okay with discussions involving the buying, selling, usage and construction of weapons (firearms, knives and explosives)." }
                ].map((item) => (
                  <div key={item.key} className="moderation-item">
                    <div className="moderation-header">
                      <h3>{item.label}</h3>
                      <div className="moderation-level">
                        <select
                          value={moderation[item.key]}
                          onChange={(e) => setModeration({ ...moderation, [item.key]: e.target.value })}
                        >
                          <option value="unfiltered">Unfiltered</option>
                          <option value="minimal">Minimal</option>
                          <option value="moderate">Moderate</option>
                          <option value="maximum">Maximum</option>
                        </select>
                      </div>
                    </div>
                    <p className="moderation-desc">{item.desc}</p>
                  </div>
                ))}

                <div className="moderation-toggles">
                  <div className="toggle-item">
                    <div>
                      <h3>Gibberish</h3>
                      <p>Block keyboard spam and phrases or words that are completely incomprehensible</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={moderation.gibberish}
                        onChange={(e) => setModeration({ ...moderation, gibberish: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div>
                      <h3>Spam</h3>
                      <p>Block any text that tries to redirect me via links, email addresses or phone numbers</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={moderation.spam}
                        onChange={(e) => setModeration({ ...moderation, spam: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button onClick={saveModerationSettings} className="btn-save" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'slow-mode' && (
            <div className="section">
              <h2>Slow Mode</h2>
              <p className="section-description">Limit how often users can send messages in your chat</p>

              <div className="slow-mode-options">
                {[
                  { label: 'Off', duration: 0 },
                  { label: '5 seconds', duration: 5 },
                  { label: '15 seconds', duration: 15 },
                  { label: '30 seconds', duration: 30 },
                  { label: '45 seconds', duration: 45 },
                  { label: '1 minute', duration: 60 },
                  { label: '2 minutes', duration: 120 }
                ].map((option) => (
                  <div
                    key={option.duration}
                    className={`slow-mode-option ${slowMode.duration === option.duration ? 'active' : ''}`}
                    onClick={() => saveSlowMode({ enabled: option.duration > 0, duration: option.duration })}
                  >
                    <div className="radio-circle">
                      {slowMode.duration === option.duration && <div className="radio-dot"></div>}
                    </div>
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'goals' && (
            <div className="section">
              <h2>Set Goals</h2>
              <p className="section-description">Set a follower goal to display on your channel</p>

              <div className="goal-input">
                <label>Follower Goal</label>
                <input
                  type="number"
                  value={followerGoal}
                  onChange={(e) => setFollowerGoal(e.target.value)}
                  placeholder="Enter target number of followers"
                  min="0"
                />
                <button onClick={saveFollowerGoal} className="btn-save" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'identity' && (
            <div className="section">
              <h2>Identity</h2>
              <p className="section-description">Customize your chat appearance</p>

              <div className="identity-preview">
                <h3>Preview:</h3>
                <div className="chat-preview">
                  <span className="preview-username" style={{ color: chatColor }}>
                    {user.username}
                  </span>
                  <span className="preview-message">: This is how your name will appear in chat!</span>
                </div>
              </div>

              <div className="color-section">
                <h3>Global name color</h3>
                <p>Choose a color to display your username in chat</p>
                <div className="color-grid">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${chatColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => saveChatColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelActions;

