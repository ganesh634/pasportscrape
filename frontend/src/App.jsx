import React, { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import FiltersBar from './components/FiltersBar';
import PostCard from './components/PostCard';
import { exportToCSV, exportToPDF } from './utils/export';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [clusteredView, setClusteredView] = useState(false);
  const [expandedClusters, setExpandedClusters] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsRes = await fetch(`${API_BASE}/posts`);
      if (!postsRes.ok) throw new Error('Failed to fetch posts');
      const postsData = await postsRes.json();
      setPosts(postsData.posts || []);
      setScraping(postsData.isScraping || false);

      const statsRes = await fetch(`${API_BASE}/stats`);
      if (!statsRes.ok) throw new Error('Failed to fetch statistics');
      const statsData = await statsRes.json();
      setStats(statsData || {});
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please verify it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleForceScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch(`${API_BASE}/posts/scrape`, { method: 'POST' });
      if (!res.ok) throw new Error('Scrape trigger failed');
      const data = await res.json();
      setPosts(data.posts || []);
      
      // Refresh stats
      const statsRes = await fetch(`${API_BASE}/stats`);
      const statsData = await statsRes.json();
      setStats(statsData || {});
    } catch (err) {
      console.error(err);
      alert('Failed to trigger live scrape.');
    } finally {
      setScraping(false);
    }
  };

  const handleTranslate = async (postId, targetLanguage) => {
    const res = await fetch(`${API_BASE}/posts/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, targetLanguage })
    });
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    return data.translatedText;
  };

  const toggleCluster = (clusterId) => {
    setExpandedClusters(prev => ({
      ...prev,
      [clusterId]: !prev[clusterId]
    }));
  };

  // 1. Client-side search and filter logic
  const filteredPosts = posts.filter(post => {
    // Platform Filter
    if (selectedPlatform !== 'All' && post.platform !== selectedPlatform) return false;

    // Category Filter
    if (selectedCategory !== 'All' && post.category !== selectedCategory) return false;

    // Sentiment Filter
    if (selectedSentiment !== 'All' && post.sentiment !== selectedSentiment) return false;

    // Search Query (Search title, original content, author, handle, summary, region)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const contentMatch = (post.content || '').toLowerCase().includes(query);
      const summaryMatch = (post.summary || '').toLowerCase().includes(query);
      const authorMatch = (post.authorName || '').toLowerCase().includes(query);
      const handleMatch = (post.handle || '').toLowerCase().includes(query);
      const regionMatch = (post.region || '').toLowerCase().includes(query);
      const categoryMatch = (post.category || '').toLowerCase().includes(query);

      if (!contentMatch && !summaryMatch && !authorMatch && !handleMatch && !regionMatch && !categoryMatch) {
        return false;
      }
    }

    return true;
  });

  // 2. Client-side sorting logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortBy === 'oldest') {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
    if (sortBy === 'engagement') {
      const engA = (a.engagement?.likes || 0) + (a.engagement?.shares || 0) + (a.engagement?.comments || 0);
      const engB = (b.engagement?.likes || 0) + (b.engagement?.shares || 0) + (b.engagement?.comments || 0);
      return engB - engA;
    }
    return 0;
  });

  // 3. Grouping logic for clustered view
  const renderPosts = () => {
    if (sortedPosts.length === 0) {
      return (
        <div className="no-results">
          <h3>No matching posts found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      );
    }

    if (!clusteredView) {
      return sortedPosts.map(post => (
        <PostCard key={post.id} post={post} onTranslate={handleTranslate} />
      ));
    }

    // Group posts by clusterId
    const groups = {};
    sortedPosts.forEach(post => {
      const cid = post.clusterId || post.id;
      if (!groups[cid]) {
        groups[cid] = {
          clusterId: cid,
          clusterTitle: post.clusterTitle || 'General Discussion',
          posts: []
        };
      }
      groups[cid].posts.push(post);
    });

    return Object.values(groups).map(group => {
      // If a cluster has only 1 post, render normally
      if (group.posts.length <= 1) {
        return <PostCard key={group.posts[0].id} post={group.posts[0]} onTranslate={handleTranslate} />;
      }

      // If a cluster has multiple posts, render as expandable thread
      const isExpanded = !!expandedClusters[group.clusterId];
      return (
        <div key={group.clusterId} className="cluster-card-group">
          <div className="cluster-header">
            <span>📚 Grouped Topic: {group.clusterTitle}</span>
            <button className="cluster-expand-btn" onClick={() => toggleCluster(group.clusterId)}>
              {isExpanded ? 'Collapse Thread' : `Expand Thread (${group.posts.length} posts)`}
            </button>
          </div>
          
          {isExpanded ? (
            group.posts.map(post => (
              <PostCard key={post.id} post={post} onTranslate={handleTranslate} />
            ))
          ) : (
            // Show only the parent post (e.g. the first one in the list or the most engaged one)
            <>
              <PostCard post={group.posts[0]} onTranslate={handleTranslate} />
              <div className="cluster-collapsed-summary">
                <span>➕ {group.posts.length - 1} more related posts collapsed under this topic.</span>
                <button className="cluster-expand-btn" onClick={() => toggleCluster(group.clusterId)}>
                  View entire thread
                </button>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <h1>Passport Intelligence Dashboard</h1>
          <p>Aggregating passport applications, appointments, Tatkal updates, renewal queues & scams</p>
        </div>

        <div className="action-section">
          {stats.lastScraped && (
            <span className="last-update">
              Last Scraped: {new Date(stats.lastScraped).toLocaleTimeString()}
            </span>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={handleForceScrape}
            disabled={scraping || loading}
          >
            {scraping ? 'Scraping feeds...' : '🔄 Scrape Live Feeds'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => exportToCSV(sortedPosts)}
            disabled={sortedPosts.length === 0}
          >
            📥 CSV Export
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => exportToPDF(sortedPosts)}
            disabled={sortedPosts.length === 0}
          >
            📄 PDF Report
          </button>
        </div>
      </header>

      {error ? (
        <div className="no-results" style={{ borderColor: 'var(--accent-danger)' }}>
          <h3 style={{ color: 'var(--accent-danger)' }}>Connection Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={fetchData}>
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
          <div className="spinner spinner-large"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading feed database and processing NLP metrics...</p>
        </div>
      ) : (
        <>
          {/* Statistics Bar */}
          <DashboardStats stats={stats} />

          {/* Filters Control Panel */}
          <FiltersBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedSentiment={selectedSentiment}
            setSelectedSentiment={setSelectedSentiment}
            sortBy={sortBy}
            setSortBy={setSortBy}
            clusteredView={clusteredView}
            setClusteredView={setClusteredView}
          />

          {/* Clean Posts Feed */}
          <div className="posts-container">
            {renderPosts()}
          </div>
        </>
      )}
    </div>
  );
}
