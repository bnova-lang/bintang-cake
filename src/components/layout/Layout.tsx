import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
export const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '32px' }}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};
