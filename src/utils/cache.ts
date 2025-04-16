/**
 * Simple in-memory cache system with expiration support
 * Helps reduce database calls for frequently accessed data
 */

interface CacheItem<T> {
  data: T;
  expires: number; // Timestamp when this cache entry expires
}

// Main cache storage
const cache: Record<string, CacheItem<any>> = {};

/**
 * Store data in the cache with an expiration time
 * @param key Unique cache key
 * @param data Data to store
 * @param minutes Minutes until expiration (default: 5)
 */
export const setInCache = <T>(key: string, data: T, minutes = 5): void => {
  if (!key) {
    console.warn('Cannot cache with empty key');
    return;
  }
  
  const expires = Date.now() + (minutes * 60 * 1000);
  
  cache[key] = {
    data,
    expires
  };
  
  // Log cache operations in development
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[CACHE] Set: ${key} (expires in ${minutes} minutes)`, data);
  }
};

/**
 * Retrieve data from cache if available and not expired
 * @param key Cache key to lookup
 * @returns Cached data or null if not found/expired
 */
export const getFromCache = <T>(key: string): T | null => {
  if (!key || !cache[key]) {
    return null;
  }
  
  const item = cache[key];
  
  // Check if expired
  if (item.expires < Date.now()) {
    // Clean up expired item
    delete cache[key];
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[CACHE] Expired: ${key}`);
    }
    
    return null;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[CACHE] Hit: ${key}`, item.data);
  }
  
  return item.data;
};

/**
 * Remove an item from the cache
 * @param key Cache key to remove
 */
export const removeFromCache = (key: string): void => {
  if (!key) return;
  
  delete cache[key];
  
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[CACHE] Removed: ${key}`);
  }
};

/**
 * Clear all items from the cache
 */
export const clearCache = (): void => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.debug('[CACHE] Cleared all cache entries');
  }
};

/**
 * Clear expired items from the cache
 * @returns Number of items cleared
 */
export const cleanupCache = (): number => {
  const now = Date.now();
  let count = 0;
  
  Object.keys(cache).forEach(key => {
    if (cache[key].expires < now) {
      delete cache[key];
      count++;
    }
  });
  
  if (count > 0 && process.env.NODE_ENV === 'development') {
    console.debug(`[CACHE] Cleaned up ${count} expired items`);
  }
  
  return count;
};

// Automatically clean up expired cache items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000);
} 