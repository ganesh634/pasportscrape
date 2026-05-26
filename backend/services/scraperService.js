import axios from 'axios';

// Helper to generate timestamps within the last 24 hours
const getRecentTimestamp = (hoursAgo) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - (hoursAgo * 60 + Math.random() * 59));
  return date.toISOString();
};

const SIMULATED_POSTS = [
  {
    id: 'sim_tw_1',
    platform: 'Twitter',
    handle: '@PassportGovInd',
    authorName: 'Passport Seva Official',
    content: 'Alert: Citizens are advised not to fall prey to fake websites charging heavy fees for passport application. Only use the official portal passportindia.gov.in or the mPassport Seva App. Check appointments schedule updates.',
    timestamp: getRecentTimestamp(2),
    region: 'India',
    language: 'English',
    engagement: { likes: 1240, shares: 890, comments: 45 }
  },
  {
    id: 'sim_tw_2',
    platform: 'Twitter',
    handle: '@VisaTravelTavern',
    authorName: 'Travel & Visa Guide',
    content: 'Just booked my passport renewal appointment under the Tatkal scheme! Surprised at how fast it got processed. Got it in just 3 days! Major props to the PSK team at Delhi. Anyone else had a quick Tatkal turnaround lately?',
    timestamp: getRecentTimestamp(4),
    region: 'India',
    language: 'English',
    engagement: { likes: 320, shares: 42, comments: 68 }
  },
  {
    id: 'sim_tw_3',
    platform: 'Twitter',
    handle: '@bot_crypto_99',
    authorName: 'A182b8a Crypto Bot',
    content: 'BUY BITCOIN FAST! Get passport visa online cheap rates! Free air drops at t.co/fakecrypto-air-drop-now! Click here now! $$$ #bitcoin #travel #passport',
    timestamp: getRecentTimestamp(1),
    region: 'Global',
    language: 'English',
    engagement: { likes: 0, shares: 1, comments: 0 }
  },
  {
    id: 'sim_fb_1',
    platform: 'Facebook',
    handle: 'amigos.viajeros',
    authorName: 'Amigos Viajeros del Mundo',
    content: '¡Atención! La renovación del pasaporte español ahora requiere cita previa obligatoria y las fechas están muy saturadas. Recomiendo revisar la web de la policía nacional a primera hora de la mañana para conseguir hueco. ¡Buen viaje a todos!',
    timestamp: getRecentTimestamp(6),
    region: 'Spain',
    language: 'Spanish',
    engagement: { likes: 512, shares: 104, comments: 89 }
  },
  {
    id: 'sim_li_1',
    platform: 'LinkedIn',
    handle: 'sarah-j-travels',
    authorName: 'Sarah Jenkins',
    content: 'Delighted to share that my visa was approved today! However, a warning to fellow remote workers: make sure your passport has at least 6 months validity left. I almost got turned back at the gate because I only had 5 months left. A simple renewal oversight could have ruined months of planning.',
    timestamp: getRecentTimestamp(8),
    region: 'United Kingdom',
    language: 'English',
    engagement: { likes: 820, shares: 15, comments: 24 }
  },
  {
    id: 'sim_yt_1',
    platform: 'YouTube',
    handle: 'PassportHacks',
    authorName: 'Passport & Visa Hacks channel',
    content: 'How to Book Passport Appointment Fast (Tatkal & Normal) | STEP-BY-STEP Walkthrough 2026. Watch the full video to see how to bypass website errors and secure slots.',
    timestamp: getRecentTimestamp(12),
    region: 'India',
    language: 'English',
    engagement: { likes: 4500, shares: 310, comments: 512 }
  },
  {
    id: 'sim_tt_1',
    platform: 'TikTok',
    handle: '@pribadi.travels',
    authorName: 'Priyanka Rawat',
    content: 'Mera Passport Renewal Experience 2026! Tatkal vs Normal scheme me kitna time lagta hai and documents verify kaise hote hai, watch till the end. #passport #psk #delhi',
    timestamp: getRecentTimestamp(3),
    region: 'India',
    language: 'Hindi',
    engagement: { likes: 12300, shares: 450, comments: 231 }
  },
  {
    id: 'sim_tw_4',
    platform: 'Twitter',
    handle: '@johndoe_travel',
    authorName: 'John Doe',
    content: 'I lost my US passport in Paris! Currently at the embassy, trying to get an emergency passport. The staff is extremely helpful but it is a stressful situation. Double check your bag zippers, folks!',
    timestamp: getRecentTimestamp(5),
    region: 'France',
    language: 'English',
    engagement: { likes: 98, shares: 10, comments: 34 }
  },
  {
    id: 'sim_tw_5',
    platform: 'Twitter',
    handle: '@scambuster_intl',
    authorName: 'Scam Buster International',
    content: 'WARNING: Fake visa agents are targeting students. They charge $500 for visa appointments and hand out forged passports. Please verify via official consulate websites.',
    timestamp: getRecentTimestamp(14),
    region: 'Global',
    language: 'English',
    engagement: { likes: 780, shares: 450, comments: 72 }
  },
  {
    id: 'sim_fb_2',
    platform: 'Facebook',
    handle: 'voyageurs.francais',
    authorName: 'Le Club des Voyageurs',
    content: 'Le nouveau passeport biométrique français est arrivé. La procédure de demande en mairie s’est simplifiée grâce à la pré-demande en ligne. Pensez à acheter votre timbre fiscal dématérialisé au préalable.',
    timestamp: getRecentTimestamp(16),
    region: 'France',
    language: 'French',
    engagement: { likes: 215, shares: 45, comments: 19 }
  },
  {
    id: 'sim_tw_6',
    platform: 'Twitter',
    handle: '@spam_bot_user_991',
    authorName: 'asdhjkhasdkj12',
    content: 'asdjkh12312389asdhjkahsd #passport #visa #tatkal asdjkhqweqwe !!!',
    timestamp: getRecentTimestamp(0.5),
    region: 'Unknown',
    language: 'English',
    engagement: { likes: 0, shares: 0, comments: 0 }
  },
  {
    id: 'sim_tw_7',
    platform: 'Twitter',
    handle: '@GurpreetS_PB',
    authorName: 'Gurpreet Singh',
    content: 'ਪਾਸਪੋਰਟ ਰੀਨਿਊ ਕਰਵਾਉਣ ਲਈ ਅਪੁਆਇੰਟਮੈਂਟ ਲੈਣਾ ਬਹੁਤ ਔਖਾ ਹੋ ਗਿਆ ਹੈ। ਜਲੰਧਰ ਕੇਂਦਰ ਵਿੱਚ ਤਾਰੀਖਾਂ ਨਹੀਂ ਮਿਲ ਰਹੀਆਂ। ਕਿਸੇ ਕੋਲ ਕੋਈ ਹੱਲ ਹੈ?',
    timestamp: getRecentTimestamp(7),
    region: 'India',
    language: 'Punjabi',
    engagement: { likes: 45, shares: 12, comments: 32 }
  }
];

export async function fetchSocialPosts() {
  const posts = [...SIMULATED_POSTS];

  try {
    // Attempt to pull real Reddit posts from /r/all containing "passport"
    // Using Reddit's public JSON API. It is unauthenticated and rate-limited but usually works fine.
    const redditUrl = 'https://www.reddit.com/r/all/search.json?q=passport&sort=new&t=day&limit=15';
    const response = await axios.get(redditUrl, {
      headers: {
        'User-Agent': 'PassportScraperDashboard/1.0.0 (by /u/antigravity)'
      },
      timeout: 5000
    });

    if (response.data && response.data.data && response.data.data.children) {
      const redditItems = response.data.data.children.map(child => {
        const item = child.data;
        return {
          id: `reddit_${item.id}`,
          platform: 'Reddit',
          handle: `/u/${item.author}`,
          authorName: item.author,
          content: `${item.title}\n\n${item.selftext || ''}`.substring(0, 1000).trim(),
          timestamp: new Date(item.created_utc * 1000).toISOString(),
          region: item.subreddit && item.subreddit.toLowerCase() === 'india' ? 'India' : 'Global',
          language: 'English', // default fallback, Gemini will reassess if needed
          engagement: {
            likes: item.ups || 0,
            shares: item.num_crossposts || 0,
            comments: item.num_comments || 0
          },
          postUrl: `https://www.reddit.com${item.permalink}`
        };
      });
      posts.push(...redditItems);
    }
  } catch (err) {
    console.error('Reddit Scraper: Could not fetch real reddit posts, proceeding with simulated posts only.', err.message);
  }

  // De-duplicate in case of any overlaps
  const seenIds = new Set();
  return posts.filter(post => {
    if (seenIds.has(post.id)) return false;
    seenIds.add(post.id);
    return true;
  });
}
