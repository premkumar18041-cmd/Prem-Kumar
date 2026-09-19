// Redis Cache Abstraction Layer for Accessories.lt
export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keysCount: number;
  uptimeSeconds: number;
}

class RedisCacheService {
  private store: Map<string, CacheEntry> = new Map();
  private hits = 0;
  private misses = 0;
  private startTime = Date.now();

  /**
   * Retrieve a cached item. Returns null if expired or missing.
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value as T;
  }

  /**
   * Store an item in cache with TTL in seconds.
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  /**
   * Invalidate a specific key or all keys matching a prefix.
   */
  public del(keyOrPrefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Flush all cached items.
   */
  public flush(): void {
    this.store.clear();
  }

  /**
   * Return cache health and hit/miss statistics.
   */
  public getStats(): CacheStats {
    // Purge expired keys before counting
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }

    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.store.size,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }

  /**
   * List active cache keys (for admin dashboard inspection).
   */
  public listKeys(): Array<{ key: string; ttlRemaining: number }> {
    const now = Date.now();
    const result: Array<{ key: string; ttlRemaining: number }> = [];
    for (const [key, entry] of this.store.entries()) {
      if (now <= entry.expiresAt) {
        result.push({
          key,
          ttlRemaining: Math.max(0, Math.round((entry.expiresAt - now) / 1000))
        });
      }
    }
    return result;
  }
}

export const redisCache = new RedisCacheService();
