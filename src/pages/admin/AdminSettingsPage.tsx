import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Shield,
  Save,
  Key,
  Store,
  Clock,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { repos } from '@/services/repositories';
import { StoreSettings, AdminUser } from '@/types';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [store, setStore] = useState<StoreSettings | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    setStore(repos.settings.getStoreSettings());
  }, []);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    repos.settings.saveStoreSettings(store);
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast('Pengaturan toko & logo resmi berhasil disimpan!', 'success');
  };

  // Upload & Compress Logo Image
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa file gambar (PNG, JPG, WEBP, SVG).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          h = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = format === 'image/png' ? undefined : 0.85;
          const compressedDataUrl = canvas.toDataURL(format, quality);

          setStore({
            ...store,
            logoUrl: compressedDataUrl,
          });
          addToast('Logo berhasil dimuat! Klik "Simpan Pengaturan Toko" untuk menerapkan ke seluruh website.', 'info');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    if (!store) return;
    setStore({
      ...store,
      logoUrl: undefined,
    });
    addToast('Logo diatur kembali ke ikon bintang bawaan. Klik Simpan untuk konfirmasi.', 'info');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      addToast('Password baru minimal 8 karakter.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi password tidak cocok.', 'warning');
      return;
    }

    setChangingPass(true);
    const admins = repos.settings.getAdminUsers();
    const currentAdmin = admins.find(a => a.id === session?.userId) || admins[0];

    if (!currentAdmin) {
      addToast('Akun admin tidak ditemukan.', 'error');
      setChangingPass(false);
      return;
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, currentAdmin.passwordHash, currentAdmin.passwordSalt);
    if (!valid) {
      addToast('Password lama Anda salah.', 'error');
      setChangingPass(false);
      return;
    }

    // Hash new password using PBKDF2 (SECURITY.md §2)
    const { hash, salt } = await hashPassword(newPassword);
    const updatedAdmin: AdminUser = {
      ...currentAdmin,
      passwordHash: hash,
      passwordSalt: salt,
    };
    repos.settings.saveAdminUser(updatedAdmin);

    setChangingPass(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Password admin berhasil diubah secara aman (PBKDF2)!', 'success');
  };

  if (!store) return <div>Memuat pengaturan...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Pengaturan Toko & Keamanan
        </h1>
        <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
          Atur informasi operasional toko, jam kerja (WITA), dan kredensial akses admin.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Store Settings Form */}
        <form onSubmit={handleSaveStore}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} color="var(--gold-600)" /> Informasi Operasional Toko
            </h2>

            {/* Logo Resmi Section */}
            <div
              style={{
                backgroundColor: 'var(--cream-50)',
                border: '1px solid var(--cream-300)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="var(--gold-600)" />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)' }}>
                    Logo Resmi Toko (Header, Footer, Invoice)
                  </span>
                </div>
                {store.logoUrl ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: '#15803D',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={13} /> Logo Kustom Aktif
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'var(--cream-200)',
                      color: 'var(--brown-700)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Memakai Ikon Standar
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '16px', lineHeight: 1.5 }}>
                Unggah logo resmi Bintang Cake & Cookies di sini. Logo akan otomatis menggantikan ikon bintang bawaan di sudut kiri atas Header navigasi, Footer, Topbar Admin, dan lembar Invoice pesanan.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'center' }}>
                {/* Live Preview Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '120px',
                      height: '80px',
                      backgroundColor: 'var(--brown-900)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                    }}
                  >
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt="Preview Logo"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: 'var(--gold-500)',
                          color: 'var(--brown-900)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Sparkles size={24} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--brown-500)', fontWeight: 500 }}>
                    Pratinjau di Header
                  </span>
                </div>

                {/* Upload & Controls */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--brown-900)',
                        color: 'var(--gold-500)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Upload size={16} /> Unggah File Logo dari Komputer
                    </button>

                    {store.logoUrl && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: 'transparent',
                          color: 'var(--brown-700)',
                          border: '1px solid var(--cream-400)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <RotateCcw size={14} /> Reset ke Ikon Bawaan
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--brown-700)', display: 'block', marginBottom: '4px' }}>
                      Atau masukkan URL gambar logo:
                    </label>
                    <input
                      type="url"
                      placeholder="https://contoh.com/logo-bintang.png"
                      value={store.logoUrl || ''}
                      onChange={e => setStore({ ...store, logoUrl: e.target.value.trim() || undefined })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--cream-300)',
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--brown-500)', margin: 0 }}>
                    💡 Tips: Disarankan file <b>PNG dengan latar transparan</b> atau JPG resolusi tajam. Gambar akan otomatis dikompresi agar hemat memori lokal.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Nama Toko *
                </label>
                <input
                  type="text"
                  value={store.storeName}
                  onChange={e => setStore({ ...store, storeName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Alamat Lengkap Gerai (Balikpapan) *
                </label>
                <textarea
                  rows={2}
                  value={store.address}
                  onChange={e => setStore({ ...store, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Nomor WhatsApp Resmi Toko *
                  </label>
                  <input
                    type="text"
                    value={store.whatsapp}
                    onChange={e => setStore({ ...store, whatsapp: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Jam Operasional (WITA)
                  </label>
                  <input
                    type="text"
                    value={store.operatingHours}
                    onChange={e => setStore({ ...store, operatingHours: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Batas Jam Pemesanan Harian (Cut-off WITA)
                  </label>
                  <input
                    type="text"
                    value={store.orderCutoffTime}
                    onChange={e => setStore({ ...store, orderCutoffTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Lead Time Pre-Order Standar (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={store.defaultPreOrderLeadDays}
                    onChange={e => setStore({ ...store, defaultPreOrderLeadDays: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Promo Reward Souvenir & Diskon Belanja Section */}
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid var(--gold-400)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gift size={20} color="var(--gold-600)" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)' }}>
                      Program Hadiah Souvenir & Diskon Belanja (Promo Checkout)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="promoRewardActive"
                      checked={store.promoRewardActive !== false}
                      onChange={e => setStore({ ...store, promoRewardActive: e.target.checked })}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="promoRewardActive" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-900)', cursor: 'pointer' }}>
                      Promo Aktif
                    </label>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--brown-700)', marginBottom: '14px', lineHeight: 1.5 }}>
                  Pelanggan yang berbelanja mencapai batas minimal (default: <b>Rp 750.000</b>) akan otomatis mendapatkan hadiah souvenir dan/atau potongan diskon di halaman checkout pemesanan serta tertera pada invoice resmi.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Minimal Belanja untuk Promo (Rp) *
                    </label>
                    <input
                      type="number"
                      step={10000}
                      min={0}
                      value={store.promoMinSpend ?? 750000}
                      onChange={e => setStore({ ...store, promoMinSpend: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Bentuk Hadiah Promo *
                    </label>
                    <select
                      value={store.promoRewardType || 'souvenir'}
                      onChange={e => setStore({ ...store, promoRewardType: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="souvenir">Hadiah Souvenir Gratis</option>
                      <option value="discount">Potongan Diskon Belanja</option>
                      <option value="both">Hadiah Souvenir + Potongan Diskon</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Nama Souvenir Hadiah *
                    </label>
                    <input
                      type="text"
                      value={store.promoSouvenirName ?? 'Souvenir Eksklusif Bintang Cake (Toples Mini Cookies Cantik)'}
                      onChange={e => setStore({ ...store, promoSouvenirName: e.target.value })}
                      placeholder="Contoh: Souvenir Eksklusif Bintang Cake (Toples Mini Cookies Cantik)"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>

                  {(store.promoRewardType === 'discount' || store.promoRewardType === 'both') && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                        Nominal Potongan Diskon (Rp)
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={store.promoDiscountValue ?? 0}
                        onChange={e => setStore({ ...store, promoDiscountValue: Number(e.target.value) })}
                        placeholder="Contoh: 25000"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--gold-500)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Save size={16} /> Simpan Pengaturan Toko
              </button>
            </div>
          </div>
        </form>

        {/* Security & Password Form */}
        <form onSubmit={handleChangePassword}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--gold-600)" /> Keamanan Akun Admin
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Password Saat Ini *
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password saat ini (demo: admin-bintang-demo)"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Password Baru (Min 8 karakter) *
                  </label>
                  <input
                    type="password"
                    placeholder="Password baru..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                    Konfirmasi Password Baru *
                  </label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="submit"
                disabled={changingPass}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--text-on-dark)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Key size={16} /> Perbarui Password Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
