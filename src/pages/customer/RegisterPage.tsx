import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Phone, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { registerCustomer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    const res = await registerCustomer(name, whatsapp, password, email);
    setIsLoading(false);

    if (res.success) {
      showToast('Pendaftaran akun berhasil!', 'success');
      navigate('/akun');
    } else {
      setError(res.error || 'Gagal mendaftar.');
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
          <span className="badge-demo" style={{ marginBottom: '8px' }}>Pendaftaran</span>
          <h1 style={{ fontSize: '26px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
            Daftar Akun Baru
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Simpan alamat dan pantau riwayat belanja kue Anda
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Nama Lengkap *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama Anda"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Nomor WhatsApp *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Email (opsional)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@anda.com"
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Password (min. 8 karakter) *
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

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Ulangi Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
              marginTop: '10px',
            }}
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--cream-300)', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link to="/masuk" style={{ color: 'var(--brown-800)', fontWeight: 700 }}>
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};
