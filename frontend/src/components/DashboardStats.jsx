import React from 'react';

export default function DashboardStats({ stats }) {
  const total = stats.totalPosts || 0;
  const spam = stats.spamCount || 0;
  
  // Calculate sentiment counts
  const positive = stats.sentiments?.positive || 0;
  const neutral = stats.sentiments?.neutral || 0;
  const negative = stats.sentiments?.negative || 0;
  
  // Find top category
  let topCategory = 'None';
  let maxCatCount = 0;
  if (stats.categories && Object.keys(stats.categories).length > 0) {
    Object.entries(stats.categories).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCategory = cat;
      }
    });
  }

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <div className="stats-label">Aggregated Feed</div>
        <div className="stats-value">{total}</div>
        <div className="stats-subtext">Active passport topics (24h)</div>
      </div>
      
      <div className="stats-card spam">
        <div className="stats-label">Gibberish Filtered</div>
        <div className="stats-value">{spam}</div>
        <div className="stats-subtext">Spam, bot & ads removed</div>
      </div>
      
      <div className="stats-card sentiment">
        <div className="stats-label">Sentiment Profile</div>
        <div className="stats-value" style={{ fontSize: '1.25rem', marginTop: '1rem', display: 'flex', gap: '0.8rem' }}>
          <span style={{ color: 'var(--accent-success)' }}>🟢 {positive}</span>
          <span style={{ color: 'var(--text-secondary)' }}>⚪ {neutral}</span>
          <span style={{ color: 'var(--accent-danger)' }}>🔴 {negative}</span>
        </div>
        <div className="stats-subtext" style={{ marginTop: '0.5rem' }}>Sentiment classifications</div>
      </div>

      <div className="stats-card platforms">
        <div className="stats-label">Top Category</div>
        <div className="stats-value" style={{ fontSize: '1.4rem', color: 'var(--accent-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {topCategory}
        </div>
        <div className="stats-subtext">Highest volume category ({maxCatCount} posts)</div>
      </div>
    </div>
  );
}
