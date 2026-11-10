import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Cookie, Gift, Image, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/providers/CartContext';

export const BottomNav: React.FC = () => {
  const { totalItems } = useCart();

  const navItems = [
    { label: 'Beranda', to: '/', icon: Home },
    { label: 'Produk', to: '/produk', icon: Cookie },
    { label: 'Spesial', to: '/spesial', icon: Gift },
    { label: 'Galeri', to: '/galeri', icon: Image },
    { label: 'Pesanan', to: '/keranjang', icon: ShoppingBag, badge: totalItems },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--ivory-50)',
        borderTop: '1px solid var(--cream-300)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 40,
        boxShadow: '0 -2px 10px rgba(59, 36, 22, 0.05)',
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--brown-800)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 700 : 500,
              gap: '3px',
              position: 'relative',
              padding: '6px 12px',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: 'relative' }}>
                  <Icon size={20} color={isActive ? 'var(--gold-600)' : 'var(--brown-500)'} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        backgroundColor: 'var(--danger-600)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-full)',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}

      <style>{`
        @media (min-width: 992px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
