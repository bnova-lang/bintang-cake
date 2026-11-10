import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { loginCustomer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await loginCustomer(identifier, password);
    setIsLoading(false);

    if (res.success) {
      showToast('Berhasil masuk ke akun!', 'success');
      navigate('/akun');
    } else {
      setError(res.error || 'Gagal masuk. Periksa nomor WhatsApp dan password Anda.');
    }
  };

  const handleDirectDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    setIdentifier('082158739760');
    setPassword('pelanggan-demo');
    const res = await loginCustomer('082158739760', 'pelanggan-demo');
    setIsLoading(false);
    if (res.success) {
      showToast('Berhasil masuk sebagai Akun Demo Pelanggan!', 'success');
      navigate('/akun');
    } else {
      setError(res.error || 'Gagal masuk akun demo.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '440px' }}>
      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          border: '1px solid var(--cream-300)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge-demo" style={{ marginBottom: '8px' }}>Akun Pelanggan</span>
          <h1 style={{ fontSize: '26px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
            Masuk ke Akun
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Akses riwayat pesanan, buku alamat, dan wishlist Anda
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
              Nomor WhatsApp / Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="082158739760 atau email"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              marginTop: '8px',
            }}
          >
            {isLoading ? 'Memeriksa...' : 'Masuk Sekarang'}
          </button>

          {/* Demo Button - 1-Click Login Pelanggan */}
          <button
            type="button"
            onClick={handleDirectDemoLogin}
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--cream-200)',
              color: 'var(--brown-900)',
              border: '1px dashed var(--gold-600)',
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            ⚡ Masuk Akun Demo Pelanggan (082158739760)
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--cream-300)', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/daftar" style={{ color: 'var(--brown-800)', fontWeight: 700 }}>
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
};
