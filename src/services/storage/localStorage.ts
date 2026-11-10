// LocalStorage Service with Zod validation and safe error handling (SCHEMA.md §2)
import { z } from 'zod';

export const STORAGE_PREFIX = 'bcc:v1:';

export interface StorageMeta {
  schemaVersion: number;
  seededAt: string;
  lastMigratedAt?: string;
}

export class LocalStorageService {
  /**
   * Get item from LocalStorage with fallback and validation
   */
  static getItem<T>(key: string, schema?: z.ZodSchema<T>, defaultValue: T | null = null): T | null {
    const fullKey = key.startsWith(STORAGE_PREFIX) ? key : `${STORAGE_PREFIX}${key}`;
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) {
        return defaultValue;
      }
      const parsed = JSON.parse(raw);
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          console.warn(`[LocalStorage] Validation failed for key "${fullKey}". Quarantining corrupt data.`, result.error);
          this.quarantineCorrupt(fullKey, raw);
          return defaultValue;
        }
        return result.data;
      }
      return parsed as T;
    } catch (e) {
      console.error(`[LocalStorage] Error parsing key "${fullKey}":`, e);
      return defaultValue;
    }
  }

  /**
   * Set item in LocalStorage with validation and quota handling
   */
  static setItem<T>(key: string, value: T, schema?: z.ZodSchema<T>): boolean {
    const fullKey = key.startsWith(STORAGE_PREFIX) ? key : `${STORAGE_PREFIX}${key}`;
    try {
      if (schema) {
        schema.parse(value);
      }
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (e: unknown) {
      if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`[LocalStorage] QuotaExceededError while writing to "${fullKey}". Attempting cleanup.`);
        // Try to clear any non-essential cache
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(`${STORAGE_PREFIX}corrupt:`)) {
              localStorage.removeItem(k);
            }
          }
        } catch {
          // ignore
        }
      } else {
        console.error(`[LocalStorage] Error setting item for key "${fullKey}":`, e);
      }
      return false;
    }
  }

  /**
   * Remove item from LocalStorage
   */
  static removeItem(key: string): void {
    const fullKey = key.startsWith(STORAGE_PREFIX) ? key : `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  }

  /**
   * Quarantine corrupted data instead of overwriting it
   */
  private static quarantineCorrupt(key: string, rawData: string): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const corruptKey = `${STORAGE_PREFIX}corrupt:${key}:${timestamp}`;
      localStorage.setItem(corruptKey, rawData);
    } catch {
      // Ignore if quota is full
    }
  }

  /**
   * Estimate total LocalStorage usage in bytes
   */
  static getStorageEstimate(): { usedBytes: number; quotaBytes: number; percentage: number } {
    let usedBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          const v = localStorage.getItem(k);
          usedBytes += (k.length + (v ? v.length : 0)) * 2; // UTF-16 characters
        }
      }
    } catch {
      // Ignore
    }
    const quotaBytes = 5 * 1024 * 1024; // 5 MB typical limit
    const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));
    return { usedBytes, quotaBytes, percentage };
  }

  /**
   * Export all bcc:v1: keys to a JSON object
   */
  static exportAllData(): Record<string, unknown> {
    const backup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX) && !k.includes(':session')) {
        try {
          const val = localStorage.getItem(k);
          if (val) {
            backup[k] = JSON.parse(val);
          }
        } catch {
          // Skip corrupt keys
        }
      }
    }
    return backup;
  }

  /**
   * Restore all keys from a JSON backup
   */
  static restoreAllData(data: Record<string, unknown>): boolean {
    try {
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.setItem(k, JSON.stringify(v));
        }
      }
      return true;
    } catch (e) {
      console.error('[LocalStorage] Error restoring data:', e);
      return false;
    }
  }
}
