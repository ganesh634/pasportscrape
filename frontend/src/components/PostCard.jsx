import React, { useState } from 'react';

const LANGUAGES = {
  English: 'English',
  Hindi: 'Hindi',
  Punjabi: 'Punjabi',
  Spanish: 'Spanish',
  French: 'French',
  German: 'German',
  Arabic: 'Arabic',
  Chinese: 'Chinese',
  Russian: 'Russian',
  Japanese: 'Japanese'
};

export default function PostCard({ post, onTranslate }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const handleTranslateChange = async (e) => {
    const lang = e.target.value;
    if (!lang) return;
    setSelectedLanguage(lang);
    setLoadingTranslation(true);

    try {
      const translation = await onTranslate(post.id, lang);
      setTranslatedText(translation);
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslatedText('Failed to load translation. Please check backend connection.');
    } finally {
      setLoadingTranslation(false);
    }
  };

  const clearTranslation = () => {
    setSelectedLanguage('');
    setTranslatedText('');
  };

  // Format date to local readable format
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = new Date() - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return 'Recent';
    }
  };

  // Platform symbol generator
  const getPlatformSymbol = (platform) => {
    switch (platform) {
      case 'Twitter': return '𝕏';
      case 'Reddit': return 'r/';
      case 'Facebook': return 'f';
      case 'Instagram': return '📷';
      case 'LinkedIn': return 'in';
      case 'YouTube': return '▶';
      case 'TikTok': return '🎵';
      default: return '💬';
    }
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <div className="author-info">
          <div className={`platform-icon-circle platform-${post.platform}`}>
            {getPlatformSymbol(post.platform)}
          </div>
          <div className="author-details">
            <span className="author-name">{post.authorName}</span>
            <span className="author-handle">
              {post.handle} • {formatTime(post.timestamp)}
            </span>
          </div>
        </div>

        <div className="post-meta-badges">
          <span className="badge badge-category">{post.category}</span>
          <span className={`badge badge-sentiment-${post.sentiment}`}>{post.sentiment}</span>
        </div>
      </div>

      <div className="post-body">{post.content}</div>

      {post.summary && (
        <div className="ai-summary-box">
          <div className="ai-summary-title">AI Summary (~30 words)</div>
          <div>{post.summary}</div>
        </div>
      )}

      {/* Dynamic Translation Panel */}
      <div className="translation-panel">
        <span className="translation-label">Translate post:</span>
        <select
          className="translation-select-inline"
          value={selectedLanguage}
          onChange={handleTranslateChange}
          disabled={loadingTranslation}
        >
          <option value="">Select Language...</option>
          {Object.entries(LANGUAGES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {loadingTranslation && <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>}
      </div>

      {translatedText && !loadingTranslation && (
        <div className="translated-content-box">
          <div className="translated-header">
            <span>Translated to {selectedLanguage}</span>
            <button className="close-trans-btn" onClick={clearTranslation}>✕ Clear</button>
          </div>
          <div>{translatedText}</div>
        </div>
      )}

      <div className="post-card-footer">
        <div className="engagement-stats">
          <div className="stat-item">👍 {post.engagement?.likes || 0}</div>
          <div className="stat-item">🔁 {post.engagement?.shares || 0}</div>
          <div className="stat-item">💬 {post.engagement?.comments || 0}</div>
        </div>

        <div className="region-lang-info">
          <span>📍 {post.region}</span>
          <span>🌐 {post.language}</span>
        </div>
      </div>
    </div>
  );
}
