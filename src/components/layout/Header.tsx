import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '@/app/providers/CartContext';
import { useAuth } from '@/app/providers/AuthContext';
import { repos } from '@/services/repositories';
import { PromoTicker } from '@/components/common/PromoTicker';

export const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { session, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [store, setStore] = useState(() => repos.settings.getStoreSettings());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUpdate = () => {
      setStore(repos.settings.getStoreSettings());
    };
    handleUpdate();
    window.addEventListener('bcc-settings-updated', handleUpdate);
    return () => window.removeEventListener('bcc-settings-updated', handleUpdate);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Beranda', to: '/' },
    { label: 'Katalog Produk', to: '/produk' },
    { label: 'Paket Spesial', to: '/spesial' },
    { label: 'Galeri', to: '/galeri' },
    { label: 'Cara Memesan', to: '/cara-memesan' },
    { label: 'Tentang Kami', to: '/tentang-kami' },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--brown-800)',
        color: 'var(--text-on-dark)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.storeName}
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '2px',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--gold-500)',
                color: 'var(--brown-900)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={24} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--gold-500)', lineHeight: 1.1 }}>
              Bintang
            </span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              Cake & Cookies
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontSize: '14px',
                      fontWeight: active ? 700 : 500,
                      color: active ? 'var(--gold-500)' : 'var(--text-on-dark)',
                      padding: '8px 0',
                      borderBottom: active ? '2px solid var(--gold-500)' : '2px solid transparent',
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Actions: Search, Cart, Account, Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Cari produk"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-on-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={20} />
          </button>

          {/* Cart Icon & Badge */}
          <Link
            to="/keranjang"
            aria-label="Keranjang Belanja"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-on-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'var(--gold-500)',
                  color: 'var(--brown-900)',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Account / Admin Link */}
          {session ? (
            <Link
              to={isAdmin ? '/admin' : '/akun'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gold-500)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <User size={16} />
              <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isAdmin ? 'Admin' : session.userName}
              </span>
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/masuk"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--brown-900)',
                  backgroundColor: 'var(--gold-500)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <User size={15} />
                <span>Masuk</span>
              </Link>
              <Link
                to="/admin"
                title="Buka Dashboard Admin"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--gold-500)',
                  border: '1px solid var(--gold-500)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              color: 'var(--text-on-dark)',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Quick Search Modal / Bar */}
      {searchOpen && (
        <div style={{ backgroundColor: 'var(--brown-900)', padding: '12px 16px', borderTop: '1px solid var(--brown-700)' }}>
          <form onSubmit={handleSearch} className="container" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Cari nastar, bolu, lidah kucing, lapis legit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--cream-300)',
                backgroundColor: 'var(--ivory-50)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--gold-500)',
                color: 'var(--brown-900)',
                padding: '0 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Cari
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--brown-900)',
            borderTop: '1px solid var(--brown-700)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="mobile-drawer"
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '15px',
                fontWeight: location.pathname === link.to ? 700 : 500,
                color: location.pathname === link.to ? 'var(--gold-500)' : 'var(--text-on-dark)',
                padding: '8px 0',
              }}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ borderColor: 'var(--brown-700)', margin: '4px 0' }} />
          <Link
            to="/lacak-pesanan"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '14px', color: 'var(--gold-500)', fontWeight: 600 }}
          >
            Lacak Pesanan Tamu
          </Link>
          <Link
            to="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
          >
            Portal Admin Toko
          </Link>
        </div>
      )}

      {/* Running Promo Ticker (Marquee Momen Natal, Lebaran, dll) */}
      <PromoTicker />

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav { display: block !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
};
