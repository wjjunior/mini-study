import type {
  AssessmentStudyResponse,
  Event,
} from "../../../domains/study/model/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class TTLCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, metadata?: Record<string, unknown>): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      metadata,
    });
  }

  invalidate(
    filter?: (key: string, metadata?: Record<string, unknown>) => boolean
  ): void {
    if (filter) {
      const keysToDelete: string[] = [];
      this.cache.forEach((entry, key) => {
        if (filter(key, entry.metadata)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const studyCache = new TTLCache<AssessmentStudyResponse>();
export const eventsCache = new TTLCache<Event[]>();

export function invalidateStudyCache(studyId: string): void {
  studyCache.invalidate((_, metadata) => metadata?.studyId === studyId);
  eventsCache.invalidate((_, metadata) => metadata?.studyId === studyId);
}
