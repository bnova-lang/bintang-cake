import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { initializeSeedData } from '@/services/repositories';
import { LocalStorageService } from '@/services/storage/localStorage';
import { SupabaseSyncService } from '@/services/storage/supabaseSync';
import { ToastProvider } from '@/app/providers/ToastContext';
import { AuthProvider } from '@/app/providers/AuthContext';
import { CartProvider } from '@/app/providers/CartContext';
import { AppRouter } from '@/app/router';

export const App: React.FC = () => {
  useEffect(() => {
    // 1. Pull latest cloud data from Supabase (syncs across all devices)
    SupabaseSyncService.pullAllItems()
      .catch(() => {})
      .finally(() => {
        // 2. Sync any local IndexedDB backups if needed
        LocalStorageService.syncFromIndexedDB().finally(() => {
          // 3. Initialize seed data on startup only if not already seeded
          initializeSeedData(false);
        });
      });
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};
