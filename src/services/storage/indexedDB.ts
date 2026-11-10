// Native IndexedDB Media Storage for High Capacity Gallery & Images
// Provides multi-megabyte / gigabyte client storage bypassing 5MB LocalStorage limits.

const DB_NAME = 'bcc_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

export interface StorageCapacity {
  usedMB: number;
  totalQuotaMB: number;
  percentage: number;
  indexedDBAvailable: boolean;
}

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  async setItem(id: string, dataUrl: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id, dataUrl, updatedAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async getItem(id: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => {
          resolve(req.result ? req.result.dataUrl : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async removeItem(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async getAllItems(): Promise<Record<string, string>> {
    try {
      const db = await this.getDB();
      return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const result: Record<string, string> = {};
          (req.result || []).forEach((item: { id: string; dataUrl: string }) => {
            result[item.id] = item.dataUrl;
          });
          resolve(result);
        };
        req.onerror = () => resolve({});
      });
    } catch {
      return {};
    }
  }

  async getCapacityEstimate(): Promise<StorageCapacity> {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usedMB = Math.round(((est.usage || 0) / (1024 * 1024)) * 100) / 100;
        const totalQuotaMB = Math.round(((est.quota || 1024 * 1024 * 500) / (1024 * 1024)));
        const percentage = totalQuotaMB > 0 ? Math.min(100, Math.round((usedMB / totalQuotaMB) * 100)) : 0;
        return {
          usedMB,
          totalQuotaMB,
          percentage,
          indexedDBAvailable: true,
        };
      }
    } catch {
      // Fallback
    }

    return {
      usedMB: 0.5,
      totalQuotaMB: 500, // typically 500MB+ available
      percentage: 1,
      indexedDBAvailable: typeof window !== 'undefined' && Boolean(window.indexedDB),
    };
  }
}

export const indexedDBStorage = new IndexedDBStorage();
