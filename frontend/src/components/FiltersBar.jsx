import React from 'react';

const CATEGORIES = [
  'Application', 'Renewal', 'Appointments', 'Tatkal', 'Visa', 
  'Travel Issues', 'Government Announcements', 'Scams/Fraud', 
  'News', 'Personal Experiences'
];

const PLATFORMS = ['Twitter', 'Reddit', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

export default function FiltersBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPlatform,
  setSelectedPlatform,
  selectedSentiment,
  setSelectedSentiment,
  sortBy,
  setSortBy,
  clusteredView,
  setClusteredView
}) {
  return (
    <div className="filters-bar">
      <div className="filters-row-primary">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search keywords across posts and summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <label className="toggle-wrapper">
          <input
            type="checkbox"
            className="hidden-checkbox"
            checked={clusteredView}
            onChange={(e) => setClusteredView(e.target.checked)}
          />
          <div className="toggle-switch"></div>
          <span>Clustered Topic View</span>
        </label>
      </div>

      <div className="filters-row-secondary">
        <div className="filter-group">
          <label>Platform</label>
          <select
            className="filter-select"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="All">All Platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Sentiment</label>
          <select
            className="filter-select"
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
          >
            <option value="All">All Sentiments</option>
            {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="engagement">Highest Engagement</option>
          </select>
        </div>
      </div>
    </div>
  );
}
