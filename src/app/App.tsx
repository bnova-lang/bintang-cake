import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { initializeSeedData } from '@/services/repositories';
import { LocalStorageService } from '@/services/storage/localStorage';
import { ToastProvider } from '@/app/providers/ToastContext';
import { AuthProvider } from '@/app/providers/AuthContext';
import { CartProvider } from '@/app/providers/CartContext';
import { AppRouter } from '@/app/router';

export const App: React.FC = () => {
  useEffect(() => {
    // 1. Sync any persisted backups from IndexedDB if needed
    LocalStorageService.syncFromIndexedDB().finally(() => {
      // 2. Initialize seed data on startup only if not already seeded
      initializeSeedData(false);
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
