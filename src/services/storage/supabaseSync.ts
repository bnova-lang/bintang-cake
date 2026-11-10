// Cloud Database Sync Service (Supabase Integration)
// Keeps all devices (laptops, mobile phones) 100% synchronized in real-time.

const SUPABASE_URL = 'https://kjvgurhrnkkssmncjnil.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DC4N0A1kLvJ6471YmgTDHA_K5mvY9TM';

export class SupabaseSyncService {
  private static isInitialized = false;

  /**
   * Push a specific key-value to Supabase cloud table
   */
  static async pushItem(key: string, value: unknown): Promise<boolean> {
    const cleanKey = key.replace(/^bcc:v1:/, '');
    // Do not sync transient user sessions across different devices
    if (cleanKey === 'session') return true;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bcc_store_data`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          key: cleanKey,
          value,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Pull all cloud data from Supabase and synchronize into device storage
   */
  static async pullAllItems(): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bcc_store_data?select=key,value,updated_at`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!res.ok) return false;
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          if (item.key && item.value !== undefined) {
            const cleanKey = item.key.replace(/^bcc:v1:/, '');
            // Do not overwrite active session
            if (cleanKey === 'session') continue;

            const fullKey = `bcc:v1:${cleanKey}`;
            try {
              localStorage.setItem(fullKey, JSON.stringify(item.value));
            } catch {
              // Ignore local quota error if any
            }
          }
        }
        this.isInitialized = true;
        // Notify components that cloud data has been updated
        window.dispatchEvent(new Event('bcc-settings-updated'));
        window.dispatchEvent(new Event('bcc-products-updated'));
        window.dispatchEvent(new Event('bcc-categories-updated'));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static isCloudConnected(): boolean {
    return this.isInitialized;
  }
}
