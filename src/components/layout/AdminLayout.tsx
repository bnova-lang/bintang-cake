import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cookie,
  ShoppingBag,
  CreditCard,
  Truck,
  Star,
  FileText,
  BarChart3,
  Database,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { repos } from '@/services/repositories';

export const AdminLayout: React.FC = () => {
  const { session, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState(() => repos.settings.getStoreSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setStore(repos.settings.getStoreSettings());
    };
    handleUpdate();
    window.addEventListener('bcc-settings-updated', handleUpdate);
    return () => window.removeEventListener('bcc-settings-updated', handleUpdate);
  }, [location.pathname]);

  // Route protection
  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { label: 'Ringkasan', to: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Produk', to: '/admin/produk', icon: Cookie },
    { label: 'Kelola Pesanan', to: '/admin/pesanan', icon: ShoppingBag },
    { label: 'Verifikasi Pembayaran', to: '/admin/pembayaran', icon: CreditCard },
    { label: 'Tarif Pengiriman', to: '/admin/pengiriman', icon: Truck },
    { label: 'Moderasi Ulasan', to: '/admin/ulasan', icon: Star },
    { label: 'Konten Website', to: '/admin/konten', icon: FileText },
    { label: 'Laporan Penjualan', to: '/admin/laporan', icon: BarChart3 },
    { label: 'Backup & Restore', to: '/admin/backup', icon: Database },
    { label: 'Pengaturan Toko', to: '/admin/pengaturan', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--cream-100)' }}>
      {/* Topbar */}
      <header
        style={{
          backgroundColor: 'var(--brown-900)',
          color: 'var(--text-on-dark)',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.storeName}
              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px' }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          )}
          <div>
            <b style={{ fontSize: '15px', color: 'var(--gold-500)', fontFamily: 'var(--font-serif)' }}>{store.storeName}</b>
            <span style={{ fontSize: '11px', color: 'var(--cream-300)', marginLeft: '6px' }}>Admin Panel</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '13px', color: 'var(--gold-500)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Buka Toko</span>
            <ExternalLink size={14} />
          </Link>
          <span style={{ fontSize: '13px', color: 'var(--cream-300)' }}>{session.userName}</span>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'var(--danger-100)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body with Sidebar */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '240px',
            backgroundColor: 'var(--ivory-50)',
            borderRight: '1px solid var(--cream-300)',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}
          className="admin-sidebar"
        >
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--brown-800)' : 'transparent',
                  color: isActive ? 'var(--text-on-dark)' : 'var(--brown-900)',
                  transition: 'background-color 0.2s',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { width: 68px !important; padding: 12px 6px !important; }
          .admin-sidebar span { display: none !important; }
          .admin-sidebar a { justify-content: center !important; padding: 10px !important; }
        }
      `}</style>
    </div>
  );
};
