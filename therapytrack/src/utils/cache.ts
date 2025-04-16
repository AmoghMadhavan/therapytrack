/**
 * Simple client-side cache utility using localStorage
 * Used to improve performance by caching frequently accessed data
 */

// App version for cache compatibility
const CACHE_VERSION = '1.0.0';
const VERSION_KEY = 'cache_version';

// Check and clear cache if version mismatch
const initializeCache = (): void => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    // If version changed or doesn't exist, clear cache
    if (storedVersion !== CACHE_VERSION) {
      console.log('Cache version mismatch, clearing cache');
      localStorage.clear();
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
    }
  } catch (e) {
    console.warn('Cache initialization failed:', e);
  }
};

// Initialize cache on module load
initializeCache();

/**
 * Get data from cache
 * @param key The cache key
 * @param defaultValue Default value if cache miss
 * @returns The cached data or defaultValue
 */
export const getFromCache = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, expiry } = JSON.parse(cached);
      if (expiry > Date.now()) {
        return data as T;
      }
      // Cache expired, clean it up
      localStorage.removeItem(key);
    }
    return defaultValue;
  } catch (e) {
    console.warn('Cache read failed:', e);
    // If there's an error reading cache (e.g., format changed),
    // remove the problematic entry
    try {
      localStorage.removeItem(key);
    } catch {}
    return defaultValue;
  }
};

/**
 * Store data in cache
 * @param key The cache key
 * @param data The data to cache
 * @param ttlMinutes Time to live in minutes
 */
export const setInCache = <T>(key: string, data: T, ttlMinutes = 5): void => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    }));
  } catch (e) {
    console.error('Cache write failed:', e);
  }
};

/**
 * Remove item from cache
 * @param key The cache key to remove
 */
export const removeFromCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Cache delete failed:', e);
  }
};

/**
 * Clear all cached data for a user
 * @param userId The user ID to clear cache for
 */
export const clearUserCache = (userId: string): void => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`user_${userId}`)) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Cache clear failed:', e);
  }
}; 