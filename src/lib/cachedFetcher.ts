/**
 * Cached GitHub Fetcher
 * Wraps githubFetcher with IndexedDB caching for persistent client-side storage
 * 
 * Features:
 * - Returns cached data immediately if fresh (< 1 hour old)
 * - Fetches fresh data in background if cache is stale
 * - Stores all fetched data in IndexedDB for offline access
 * - Handles duplicates via upsert operations
 */

import {
  fetchRepoStats as fetchRepoStatsAPI,
  fetchMultipleRepoStats as fetchMultipleRepoStatsAPI,
  fetchRepoReadme as fetchRepoReadmeAPI,
  checkRateLimit,
  type ReadmeCache,
  type RateLimitInfo,
} from './githubFetcher';

import {
  getCachedRepoStats,
  getCachedMultipleRepoStats,
  setCachedRepoStats,
  setCachedMultipleRepoStats,
  getCachedReadme,
  setCachedReadme,
  isCacheFresh,
  getReposNeedingRefresh,
  clearExpiredCache,
  getCacheStats,
  type CachedRepoStats,
} from './idb-cache';

import type { LiveStats, RepoStatus } from './schemas';

// ============================================
// Cached Fetch Functions
// ============================================

/**
 * Fetch repo stats with IndexedDB caching
 * Returns cached data if fresh, otherwise fetches from API and caches
 */
export async function fetchRepoStatsWithCache(
  owner: string,
  repo: string,
  forceRefresh: boolean = false
): Promise<{ 
  stats: LiveStats | null; 
  status: RepoStatus; 
  fromCache: boolean;
  rateLimit: RateLimitInfo | null;
  error?: string;
}> {
  const fullName = `${owner}/${repo}`;
  
  // Try to get from cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await getCachedRepoStats(fullName, true);
    if (cached) {
      return {
        stats: cached.stats,
        status: cached.status,
        fromCache: true,
        rateLimit: null,
      };
    }
  }
  
  // Fetch from API
  const result = await fetchRepoStatsAPI(owner, repo);
  
  // Cache the result (even if error, cache the status)
  if (result.stats || result.status === 'deleted') {
    await setCachedRepoStats(fullName, result.stats, result.status);
  }
  
  return {
    stats: result.stats,
    status: result.status,
    fromCache: false,
    rateLimit: result.rateLimit,
    error: result.error,
  };
}

/**
 * Fetch multiple repo stats with IndexedDB caching
 * Efficiently fetches only repos that need refresh
 */
export async function fetchMultipleRepoStatsWithCache(
  repos: { owner: string; repo: string }[],
  concurrency: number = 3,
  forceRefresh: boolean = false
): Promise<Map<string, { stats: LiveStats | null; status: RepoStatus; fromCache: boolean }>> {
  const results = new Map<string, { stats: LiveStats | null; status: RepoStatus; fromCache: boolean }>();
  
  if (repos.length === 0) return results;
  
  const fullNames = repos.map(r => `${r.owner}/${r.repo}`);
  
  // Get all cached data first
  const cachedData = await getCachedMultipleRepoStats(fullNames, !forceRefresh);
  
  // Determine which repos need fresh data
  const reposToFetch: { owner: string; repo: string }[] = [];
  
  for (const { owner, repo } of repos) {
    const fullName = `${owner}/${repo}`;
    const cached = cachedData.get(fullName);
    
    if (cached && !forceRefresh) {
      // Use cached data
      results.set(fullName, {
        stats: cached.stats,
        status: cached.status,
        fromCache: true,
      });
    } else {
      // Need to fetch
      reposToFetch.push({ owner, repo });
    }
  }
  
  // Fetch missing/stale repos from API
  if (reposToFetch.length > 0) {
    const freshData = await fetchMultipleRepoStatsAPI(reposToFetch, concurrency);
    
    // Cache and add to results
    const toCache: Array<{ fullName: string; stats: LiveStats | null; status: RepoStatus }> = [];
    
    for (const [fullName, data] of freshData) {
      results.set(fullName, {
        stats: data.stats,
        status: data.status,
        fromCache: false,
      });
      toCache.push({
        fullName,
        stats: data.stats,
        status: data.status,
      });
    }
    
    // Bulk cache the fresh data
    await setCachedMultipleRepoStats(toCache);
  }
  
  return results;
}

/**
 * Fetch README with IndexedDB caching
 */
export async function fetchRepoReadmeWithCache(
  owner: string,
  repo: string,
  forceRefresh: boolean = false
): Promise<{ 
  readme: ReadmeCache | null; 
  fromCache: boolean;
  error?: string;
}> {
  const fullName = `${owner}/${repo}`;
  
  // Try to get from cache first
  if (!forceRefresh) {
    const cached = await getCachedReadme(fullName, true);
    if (cached) {
      return {
        readme: {
          fullName: cached.fullName,
          readme_html: cached.readme_html,
          readme_excerpt: cached.readme_excerpt,
          image_url: cached.image_url,
          lastFetched: cached.lastFetched,
        },
        fromCache: true,
      };
    }
  }
  
  // Fetch from API
  const result = await fetchRepoReadmeAPI(owner, repo);
  
  // Cache the result
  if (result.readme) {
    await setCachedReadme(result.readme);
  }
  
  return {
    readme: result.readme,
    fromCache: false,
    error: result.error,
  };
}

// ============================================
// Background Refresh Functions
// ============================================

/**
 * Refresh stale cache entries in background
 * Call this on page load to update old data
 */
export async function refreshStaleCacheInBackground(
  repos: { owner: string; repo: string }[]
): Promise<void> {
  if (repos.length === 0) return;
  
  const fullNames = repos.map(r => `${r.owner}/${r.repo}`);
  const staleRepos = await getReposNeedingRefresh(fullNames);
  
  if (staleRepos.length === 0) return;
  
  // Convert back to owner/repo format
  const reposToRefresh = staleRepos.map(fullName => {
    const [owner, ...repoParts] = fullName.split('/');
    return { owner, repo: repoParts.join('/') };
  });
  
  console.log(`[Cache] Refreshing ${reposToRefresh.length} stale entries in background...`);
  
  // Fetch in background with lower concurrency to not block UI
  await fetchMultipleRepoStatsWithCache(reposToRefresh, 2, true);
  
  console.log(`[Cache] Background refresh complete`);
}

/**
 * Initialize cache on page load
 * Clears expired entries and returns cache stats
 */
export async function initializeCache(): Promise<{
  totalCached: number;
  expiredCleared: number;
}> {
  // Clear expired entries
  const expiredCleared = await clearExpiredCache();
  
  // Get current stats
  const stats = await getCacheStats();
  
  console.log(`[Cache] Initialized: ${stats.totalRepoStats} repos cached, ${stats.totalReadmes} READMEs, ${expiredCleared} expired cleared`);
  
  return {
    totalCached: stats.totalRepoStats,
    expiredCleared,
  };
}

// ============================================
// Re-export original functions and types
// ============================================

export {
  checkRateLimit,
  type ReadmeCache,
  type RateLimitInfo,
};

// Re-export cache utilities
export {
  getCachedRepoStats,
  getCachedMultipleRepoStats,
  getCachedReadme,
  getCacheStats,
  clearExpiredCache,
  isCacheFresh,
  type CachedRepoStats,
};
