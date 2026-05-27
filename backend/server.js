import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchSocialPosts } from './services/scraperService.js';
import { processPost, clusterPosts, translatePost } from './services/geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory store for scraped and processed posts
let processedPosts = [];
let spamPostsCount = 0;
let lastScrapedTime = null;
let isScrapingInProgress = false;

// Trigger scraping and processing pipeline
async function runScrapeAndProcessPipeline() {
  if (isScrapingInProgress) {
    console.log('Scrape already in progress. Skipping duplicate request.');
    return;
  }
  isScrapingInProgress = true;
  console.log('Starting scraping & processing pipeline...');

  try {
    const rawPosts = await fetchSocialPosts();
    console.log(`Fetched ${rawPosts.length} raw posts. Processing with Gemini...`);

    const processed = [];
    let spamCount = 0;

    for (const rawPost of rawPosts) {
      try {
        const enrichedPost = await processPost(rawPost);
        if (enrichedPost.isGibberish) {
          spamCount++;
        } else {
          processed.push(enrichedPost);
        }
      } catch (err) {
        console.error(`Error processing post ${rawPost.id}:`, err.message);
        // Fallback to push raw post
        processed.push({
          ...rawPost,
          isGibberish: false,
          category: 'Personal Experiences',
          summary: rawPost.content.substring(0, 150) + '...',
          sentiment: 'neutral'
        });
      }
    }

    console.log(`Gemini enrichment done. Clean posts: ${processed.length}, Spam/Gibberish removed: ${spamCount}`);
    
    // Cluster the clean posts
    console.log('Running semantic clustering with Gemini...');
    const clustered = await clusterPosts(processed);

    // Save to memory
    processedPosts = clustered;
    spamPostsCount = spamCount;
    lastScrapedTime = new Date().toISOString();
    console.log('Pipeline finished successfully. Database updated.');
  } catch (error) {
    console.error('Failed to run scrape and process pipeline:', error.message);
    throw error;
  } finally {
    isScrapingInProgress = false;
  }
}

// REST APIs

// 1. Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    if (processedPosts.length === 0 && !isScrapingInProgress) {
      await runScrapeAndProcessPipeline();
    }
    res.json({
      posts: processedPosts,
      spamCount: spamPostsCount,
      lastScraped: lastScrapedTime,
      isScraping: isScrapingInProgress
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve posts', message: error.message });
  }
});

// 2. Force trigger scrape
app.post('/api/posts/scrape', async (req, res) => {
  try {
    if (isScrapingInProgress) {
      return res.status(409).json({ error: 'Scraping is already in progress.' });
    }
    
    // Trigger in background or await? We await to let the frontend know it is done.
    await runScrapeAndProcessPipeline();
    
    res.json({
      success: true,
      message: 'Scraping and processing pipeline completed successfully.',
      posts: processedPosts,
      spamCount: spamPostsCount,
      lastScraped: lastScrapedTime
    });
  } catch (error) {
    res.status(500).json({ error: 'Scrape pipeline failed', message: error.message });
  }
});

// 3. Translate a post
app.post('/api/posts/translate', async (req, res) => {
  const { postId, targetLanguage } = req.body;

  if (!postId || !targetLanguage) {
    return res.status(400).json({ error: 'Missing postId or targetLanguage.' });
  }

  try {
    const post = processedPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const translatedText = await translatePost(post.content, targetLanguage);
    res.json({
      postId,
      targetLanguage,
      translatedText
    });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

// 4. Get Statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    totalPosts: processedPosts.length,
    spamCount: spamPostsCount,
    lastScraped: lastScrapedTime,
    platforms: {},
    categories: {},
    sentiments: { positive: 0, neutral: 0, negative: 0 },
    regions: {}
  };

  processedPosts.forEach(post => {
    // Platforms
    stats.platforms[post.platform] = (stats.platforms[post.platform] || 0) + 1;
    // Categories
    stats.categories[post.category] = (stats.categories[post.category] || 0) + 1;
    // Sentiments
    if (stats.sentiments[post.sentiment] !== undefined) {
      stats.sentiments[post.sentiment]++;
    } else {
      stats.sentiments[post.sentiment] = 1;
    }
    // Regions
    stats.regions[post.region] = (stats.regions[post.region] || 0) + 1;
  });

  res.json(stats);
});

// Serve static assets from frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback all other routes to frontend's index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initial scrape in background on boot
  runScrapeAndProcessPipeline().catch(err => {
    console.error('Initial background boot scrape failed:', err.message);
  });
});
