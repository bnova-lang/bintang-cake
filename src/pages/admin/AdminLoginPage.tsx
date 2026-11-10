import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await loginAdmin(username, password);
    setIsLoading(false);

    if (res.success) {
      showToast('Berhasil masuk ke Dashboard Admin!', 'success');
      navigate('/admin');
    } else {
      setError(res.error || 'Username atau password admin salah.');
    }
  };

  const handleDirectDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    setUsername('admin');
    setPassword('admin-bintang-demo');
    const res = await loginAdmin('admin', 'admin-bintang-demo');
    setIsLoading(false);
    if (res.success) {
      showToast('Berhasil masuk ke Dashboard Admin!', 'success');
      navigate('/admin');
    } else {
      setError(res.error || 'Gagal masuk akun demo admin.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '60px', maxWidth: '440px' }}>
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
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brown-900)', color: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <ShieldCheck size={28} />
          </div>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--cream-200)', color: 'var(--brown-800)', padding: '2px 8px', borderRadius: '12px', marginBottom: '8px' }}>PORTAL PENGELOLA</span>
          <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: '4px 0 6px' }}>
            Login Admin Toko
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Masuk untuk mengelola produk, pesanan, dan operasional toko Bintang Cake & Cookies.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Username Admin
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
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
              backgroundColor: 'var(--brown-800)',
              color: 'var(--text-on-dark)',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              marginTop: '6px',
            }}
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
          </button>

          <button
            type="button"
            onClick={handleDirectDemoLogin}
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--gold-100)',
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
            ⚡ Masuk Langsung Dashboard Admin (admin)
          </button>
        </form>
      </div>
    </div>
  );
};
