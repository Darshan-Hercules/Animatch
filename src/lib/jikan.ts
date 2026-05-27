// Jikan API Client for AniMatch
// Includes caching and request throttling to prevent HTTP 429 (Rate Limit) errors.

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 400; // 400ms delay between consecutive requests (max 2.5 req/sec)

/**
 * Throttling helper to ensure we respect the Jikan rate limit
 */
async function throttle() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
}

/**
 * Core fetch function with caching and rate limiting
 */
async function fetchFromJikan(endpoint: string): Promise<any> {
  const url = `${JIKAN_BASE_URL}${endpoint}`;
  
  // Check Cache
  const cached = cache[url];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Throttle
  await throttle();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Jikan API rate limit hit. Waiting 1.5 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return fetchFromJikan(endpoint); // retry
      }
      throw new Error(`Jikan API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    // Save to Cache
    cache[url] = {
      data: json.data,
      timestamp: Date.now()
    };

    return json.data;
  } catch (error) {
    console.error(`Failed to fetch from Jikan endpoint ${endpoint}:`, error);
    throw error;
  }
}

export interface AnimeInfo {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number | null;
  episodes: number | null;
  genres: Array<{ mal_id: number; name: string }>;
  status: string;
  synopsis: string | null;
  year: number | null;
}

export const jikanApi = {
  /**
   * Get top trending anime
   */
  async getTrending(limit = 15): Promise<AnimeInfo[]> {
    const data = await fetchFromJikan(`/top/anime?limit=${limit}`);
    return data || [];
  },

  /**
   * Search anime by query string
   */
  async search(query: string, limit = 20): Promise<AnimeInfo[]> {
    if (!query || query.trim() === '') return [];
    
    const normalized = query.toLowerCase().trim();
    
    // 1. Detect if the user wants top/best/popular/highest rated anime list
    const topRegex = /(?:top|best|highest\s+rated?|highest\s+ratings?|popular)/i;
    const isTopQuery = topRegex.test(normalized);
    
    // Extract a numeric limit if specified in the query (e.g. "top 10" -> 10)
    let parsedLimit = limit;
    const matchLimit = normalized.match(/\b(\d+)\b/);
    if (matchLimit) {
      const num = parseInt(matchLimit[1], 10);
      if (num > 0 && num <= 100) {
        parsedLimit = num;
      }
    }
    
    // 2. Detect common anime genres in the query
    const genreMappings: Record<string, string> = {
      action: 'genres=1',
      fight: 'genres=1',
      fighting: 'genres=1',
      adventure: 'genres=2',
      comedy: 'genres=4',
      funny: 'genres=4',
      drama: 'genres=8',
      fantasy: 'genres=10',
      magic: 'genres=10&q=magic', // Combine Fantasy + search term magic
      magical: 'genres=10&q=magic',
      romance: 'genres=22',
      romantic: 'genres=22',
      roamance: 'genres=22', // support user's typo: "roamance"
      love: 'genres=22',
      scifi: 'genres=24',
      'sci-fi': 'genres=24',
      cyberpunk: 'genres=24&q=cyberpunk',
      sports: 'genres=30',
      sport: 'genres=30',
      'slice of life': 'genres=36',
      supernatural: 'genres=37',
      mystery: 'genres=7',
      horror: 'genres=14',
      scary: 'genres=14'
    };

    // Check if any mapped genre exists in the search query
    let detectedGenreParams = '';
    for (const key of Object.keys(genreMappings)) {
      if (new RegExp(`\\b${key}\\b`, 'i').test(normalized)) {
        detectedGenreParams = genreMappings[key];
        break;
      }
    }

    // 3. Construct intelligent endpoint
    if (isTopQuery && detectedGenreParams) {
      // E.g. "top 5 romance anime"
      const endpoint = `/anime?${detectedGenreParams}&order_by=score&sort=desc&limit=${parsedLimit}`;
      const data = await fetchFromJikan(endpoint);
      return data || [];
    } else if (isTopQuery) {
      // E.g. "top 10 anime" or "highest ratings anime"
      const endpoint = `/top/anime?limit=${parsedLimit}`;
      const data = await fetchFromJikan(endpoint);
      return data || [];
    } else if (detectedGenreParams) {
      // E.g. "romance anime" or "fighting anime"
      const endpoint = `/anime?${detectedGenreParams}&order_by=score&sort=desc&limit=${parsedLimit}`;
      const data = await fetchFromJikan(endpoint);
      return data || [];
    }

    // 4. Default: Standard text query fallback
    const data = await fetchFromJikan(`/anime?q=${encodeURIComponent(query)}&limit=${limit}`);
    return data || [];
  },

  /**
   * Get recommendations (falls back to top action/fantasy if recommendation list is sparse)
   */
  async getRecommendations(): Promise<AnimeInfo[]> {
    try {
      // Fetch some top anime of Action (genre ID: 1) or Sci-Fi (genre ID: 24) or Fantasy (genre ID: 10)
      const data = await fetchFromJikan('/anime?genres=1,10&order_by=score&sort=desc&limit=15');
      return data || [];
    } catch {
      // Fallback to top anime if genre filter fails
      const data = await fetchFromJikan('/top/anime?limit=15');
      return data || [];
    }
  },

  /**
   * Get details for a single anime
   */
  async getDetails(id: number): Promise<AnimeInfo> {
    return await fetchFromJikan(`/anime/${id}`);
  }
};
