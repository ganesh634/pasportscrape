import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('Gemini API Service initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini API Client. Falling back to simulation.', error.message);
  }
} else {
  console.log('No GEMINI_API_KEY found. Operating in simulation fallback mode.');
}

// Translate a single post text to target language
export async function translatePost(text, targetLanguage) {
  if (!text || text.trim() === '') return '';
  
  if (ai) {
    try {
      const prompt = `You are a translator. Translate the following social media post text to the language: "${targetLanguage}".
Return ONLY the translated text. Do not include any notes, explanations, or quotes.

Text to translate:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.error(`Gemini Translation Error for language ${targetLanguage}:`, error.message);
    }
  }

  // Fallback translation rules (simulated responses)
  const simulatedTranslations = {
    'hindi': `[अनुवाद - हिन्दी]: ${text} (यह एक सिम्युलेटेड अनुवाद है)`,
    'punjabi': `[ਅਨੁਵਾਦ - ਪੰਜਾਬੀ]: ${text} (ਇਹ ਇੱਕ ਸਿਮੂਲੇਟਡ ਅਨੁਵਾਦ ਹੈ)`,
    'spanish': `[Traducción - Español]: ${text} (Esta es una traducción simulada)`,
    'french': `[Traduction - Français]: ${text} (Il s'agit d'une traduction simulée)`,
    'german': `[Übersetzung - Deutsch]: ${text} (Dies ist eine simulierte Übersetzung)`,
    'arabic': `[ترجمة - العربية]: ${text} (هذه ترجمة محاكاة)`,
    'chinese': `[翻译 - 中文]: ${text} (这是模拟翻译)`,
    'russian': `[Перевод - Русский]: ${text} (Это симулированный перевод)`,
    'japanese': `[翻訳 - 日本語]: ${text} (これはシミュレーション翻訳です)`,
    'english': `[Translation - English]: ${text} (This is a simulated translation)`
  };

  const key = targetLanguage.toLowerCase().trim();
  return simulatedTranslations[key] || `[Translation - ${targetLanguage}]: ${text}`;
}

// Process single post: categorization, gibberish filter, summary, sentiment, region
export async function processPost(post) {
  const content = post.content || '';

  if (ai) {
    try {
      const prompt = `Analyze this social media post content:
"${content}"

Respond with a JSON object containing these exact fields:
1. isGibberish (boolean): true if the text is spam, bot output, advertising unrelated links, or nonsense gibberish.
2. category (string): Must be exactly one of the following values: "Application", "Renewal", "Appointments", "Tatkal", "Visa", "Travel Issues", "Government Announcements", "Scams/Fraud", "News", "Personal Experiences".
3. summary (string): A concise summary of about 30 words.
4. sentiment (string): Must be exactly one of: "positive", "neutral", "negative".
5. region (string): The primary country or region mentioned or associated (e.g. "India", "Spain", "France", "United Kingdom", "Global").
6. language (string): The primary language of the post (e.g. "English", "Spanish", "French", "Hindi", "Punjabi", etc.).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        return {
          ...post,
          isGibberish: !!result.isGibberish,
          category: result.category || 'Personal Experiences',
          summary: result.summary || content.substring(0, 150) + '...',
          sentiment: result.sentiment || 'neutral',
          region: result.region || post.region || 'Global',
          language: result.language || post.language || 'English'
        };
      }
    } catch (error) {
      console.error('Gemini Process Post Error, falling back to heuristics:', error.message);
    }
  }

  // Heuristic-based fallback processor
  const text = content.toLowerCase();
  let isGibberish = false;
  let category = 'Personal Experiences';
  let sentiment = 'neutral';
  let region = post.region || 'Global';
  let language = post.language || 'English';

  // Simple spam / bot heuristics
  if (text.includes('buy bitcoin') || text.includes('crypto') || text.includes('asdjkh') || text.includes('$$$')) {
    isGibberish = true;
  }

  // Heuristic categories
  if (text.includes('appointment') || text.includes('slot') || text.includes('cita')) {
    category = 'Appointments';
  } else if (text.includes('renew') || text.includes('renovación') || text.includes('expiration') || text.includes('expired')) {
    category = 'Renewal';
  } else if (text.includes('tatkal')) {
    category = 'Tatkal';
  } else if (text.includes('visa') || text.includes('consulate') || text.includes('embassy')) {
    category = 'Visa';
  } else if (text.includes('fake') || text.includes('scam') || text.includes('fraud') || text.includes('forged')) {
    category = 'Scams/Fraud';
  } else if (text.includes('alert') || text.includes('official') || text.includes('advise') || text.includes('announces')) {
    category = 'Government Announcements';
  } else if (text.includes('lost') || text.includes('stolen') || text.includes('issue') || text.includes('stressful') || text.includes('stuck')) {
    category = 'Travel Issues';
    sentiment = 'negative';
  } else if (text.includes('delighted') || text.includes('success') || text.includes('fast') || text.includes('props')) {
    sentiment = 'positive';
  }

  if (text.includes('delhi') || text.includes('india') || text.includes('seva')) {
    region = 'India';
  } else if (text.includes('paris') || text.includes('france') || text.includes('français')) {
    region = 'France';
  } else if (text.includes('españa') || text.includes('español')) {
    region = 'Spain';
  }

  // Text summary simulation (~30 words)
  let summary = `This post discusses passport details.`;
  if (category === 'Appointments') {
    summary = `The author details the process or difficulty of booking passport and visa appointments, sharing advice on scheduling and timelines.`;
  } else if (category === 'Renewal') {
    summary = `Focuses on renewing an expiring passport, highlighting documentation requirements, online pre-application details, or delays.`;
  } else if (category === 'Tatkal') {
    summary = `Shares personal feedback on fast-track passport processing under the Tatkal scheme, noting quick turnaround times.`;
  } else if (category === 'Scams/Fraud') {
    summary = `Warns travelers and applicants about fraudulent agents, fake booking websites, and passport forgery scams.`;
  } else if (category === 'Travel Issues') {
    summary = `Describes an emergency situation involving a lost or stolen passport abroad, and seeking assistance at the embassy.`;
  } else if (category === 'Government Announcements') {
    summary = `Official government advisory cautioning the public about unauthorized portals and sharing official application links.`;
  }

  return {
    ...post,
    isGibberish,
    category,
    summary,
    sentiment,
    region,
    language
  };
}

// Cluster clean posts based on content similarity
export async function clusterPosts(posts) {
  if (posts.length === 0) return [];

  if (ai) {
    try {
      const prompt = `Group the following social media posts into clusters of duplicate, near-duplicate, or highly similar topics.
For each post, assign a clusterId.
If a post is unique and does not share a topic with any other post, assign it its own post ID as its clusterId.
For posts that are highly similar or share the same topic/incident, assign them the EXACT SAME clusterId and provide a short, descriptive clusterTitle for that group.

Posts to cluster:
${JSON.stringify(posts.map(p => ({ id: p.id, content: p.content })))}

Return the output as a JSON array of objects with fields: id, clusterId, clusterTitle.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const clusters = JSON.parse(response.text.trim());
        const clusterMap = new Map();
        clusters.forEach(c => {
          clusterMap.set(c.id, { clusterId: c.clusterId, clusterTitle: c.clusterTitle });
        });

        return posts.map(post => {
          const mapping = clusterMap.get(post.id);
          return {
            ...post,
            clusterId: mapping ? mapping.clusterId : post.id,
            clusterTitle: mapping ? mapping.clusterTitle : 'General Passport Discussion'
          };
        });
      }
    } catch (error) {
      console.error('Gemini Clustering Error, falling back to heuristics:', error.message);
    }
  }

  // Heuristic clustering fallback
  // Group by broad category matching or common keyword sets
  const clusterMap = new Map();
  
  posts.forEach(post => {
    let clusterId = post.id;
    let clusterTitle = 'General Passport Discussion';

    const text = post.content.toLowerCase();

    if (text.includes('tatkal')) {
      clusterId = 'cluster_tatkal';
      clusterTitle = 'Tatkal Passport Application Experiences';
    } else if (text.includes('scam') || text.includes('fake') || text.includes('agent')) {
      clusterId = 'cluster_scam_alert';
      clusterTitle = 'Advisories on Fake Passport Websites & Scams';
    } else if (text.includes('appointment') || text.includes('cita') || text.includes('appointment')) {
      clusterId = 'cluster_appointments';
      clusterTitle = 'Booking Passport Appointments & Slot Availability';
    } else if (text.includes('lost') || text.includes('stolen') || text.includes('emergency passport')) {
      clusterId = 'cluster_lost_passport';
      clusterTitle = 'Emergency Passport Procedures Abroad';
    } else if (text.includes('biométrique') || text.includes('biometric') || text.includes('nouvel')) {
      clusterId = 'cluster_biometric';
      clusterTitle = 'Biometric Passport Rollouts & Upgrades';
    }

    clusterMap.set(post.id, { clusterId, clusterTitle });
  });

  return posts.map(post => {
    const clusterInfo = clusterMap.get(post.id);
    return {
      ...post,
      clusterId: clusterInfo.clusterId,
      clusterTitle: clusterInfo.clusterTitle
    };
  });
}
