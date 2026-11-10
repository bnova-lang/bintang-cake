import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Eye, ShieldCheck, ToggleLeft, ToggleRight, Save, Edit2, Plus, X, Upload, Check } from 'lucide-react';
import { repos } from '@/services/repositories';
import { PaymentSetting, Order } from '@/types';
import { formatRupiah, formatDateTimeWITA } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminPaymentsPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formAccountName, setFormAccountName] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formType, setFormType] = useState<'bank_transfer' | 'qris' | 'cod' | 'ewallet'>('bank_transfer');
  const [formQrisUrl, setFormQrisUrl] = useState('');
  const [formActive, setFormActive] = useState(true);

  const loadData = () => {
    setSettings(repos.settings.getPaymentSettings());
    const allOrders = repos.order.getAll();
    setPendingOrders(allOrders.filter(o => o.paymentStatus === 'waiting_verification'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSetting = (setting: PaymentSetting) => {
    const updated = { ...setting, active: !setting.active };
    repos.settings.savePaymentSetting(updated);
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(`Metode ${setting.accountName || setting.bankName} berhasil ${updated.active ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
    loadData();
  };

  const handleOpenEdit = (setting: PaymentSetting) => {
    setEditingId(setting.id);
    setFormAccountName(setting.accountName || setting.bankName || '');
    setFormBankName(setting.bankName || setting.accountName || '');
    setFormAccountNumber(setting.accountNumber || '');
    setFormAccountHolder(setting.accountHolder || '');
    setFormInstructions(setting.instructions || '');
    setFormType((setting.type as any) || (setting.method === 'transfer_bank' ? 'bank_transfer' : setting.method) || 'bank_transfer');
    setFormQrisUrl(setting.qrisImageUrl || '');
    setFormActive(setting.active);
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormAccountName('Bank SeaBank');
    setFormBankName('Bank SeaBank');
    setFormAccountNumber('');
    setFormAccountHolder('Bintang Cake & Cookies');
    setFormInstructions('Transfer ke rekening di atas, lalu unggah bukti transfer.');
    setFormType('bank_transfer');
    setFormQrisUrl('');
    setFormActive(true);
    setModalOpen(true);
  };

  const handleUploadQris = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa gambar JPG/PNG/WEBP.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        setFormQrisUrl(canvas.toDataURL('image/jpeg', 0.85));
        addToast('Gambar QRIS berhasil dimuat & dikompresi.', 'info');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountName.trim()) {
      addToast('Nama bank / saluran pembayaran wajib diisi.', 'warning');
      return;
    }

    const id = editingId || 'pay-' + Date.now();
    const updated: PaymentSetting = {
      id,
      method: formType === 'bank_transfer' ? 'transfer_bank' : formType,
      type: formType,
      accountName: formAccountName.trim(),
      bankName: formBankName.trim() || formAccountName.trim(),
      accountNumber: formAccountNumber.trim(),
      accountHolder: formAccountHolder.trim(),
      instructions: formInstructions.trim(),
      qrisImageUrl: formType === 'qris' ? formQrisUrl : undefined,
      isDemo: false,
      active: formActive,
    };

    repos.settings.savePaymentSetting(updated);
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(editingId ? `Pengaturan rekening "${formAccountName}" berhasil disimpan!` : `Rekening baru "${formAccountName}" berhasil ditambahkan!`, 'success');
    setModalOpen(false);
    loadData();
  };

  const handleQuickVerify = (order: Order) => {
    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      paymentStatus: 'verified',
      updatedAt: now,
      changeHistory: [
        ...order.changeHistory,
        {
          changedAt: now,
          actor: 'admin',
          actorName: 'Admin',
          description: 'Pembayaran diverifikasi dari menu Pengaturan Pembayaran.',
        },
      ],
    };
    repos.order.update(updated);
    addToast(`Pembayaran pesanan ${order.orderNumber} berhasil diverifikasi!`, 'success');
    loadData();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Verifikasi & Pengaturan Rekening Pembayaran
        </h1>
        <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
          Kelola nomor rekening resmi toko (Bank SeaBank, BRI, Mandiri, QRIS Toko), dan verifikasi bukti transfer pembayaran pelanggan.
        </p>
      </div>

      {/* Info Banner */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          borderLeft: '4px solid #2563EB',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <ShieldCheck size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: 1.5 }}>
          <b>Pengaturan Rekening Resmi Toko:</b> Anda dapat menyesuaikan nomor rekening, nama pemilik rekening (a.n.), dan petunjuk transfer dengan rekening resmi Bintang Cake & Cookies (termasuk <b>Bank SeaBank</b>, BRI, Mandiri, dan QRIS Toko). Seluruh data disimpan langsung di sistem toko Anda.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Pending Verification Orders */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--gold-600)" /> Menunggu Verifikasi ({pendingOrders.length})
          </h2>

          {pendingOrders.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--brown-500)', fontSize: '13px' }}>
              Tidak ada pembayaran yang menunggu verifikasi saat ini.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingOrders.map(order => (
                <div
                  key={order.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--cream-100)',
                    border: '1px solid var(--cream-300)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--brown-900)' }}>{order.orderNumber}</span>
                      <div style={{ fontSize: '12px', color: 'var(--brown-600)' }}>
                        {order.customerName} ({order.customerPhone})
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--brown-900)' }}>{formatRupiah(order.totalAmount)}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--brown-700)', marginBottom: '10px' }}>
                    Metode: {order.paymentMethod.replace(/_/g, ' ').toUpperCase()} • {formatDateTimeWITA(order.createdAt)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {order.paymentProof && (
                      <button
                        onClick={() => setSelectedProof(order.paymentProof || null)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--cream-300)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} /> Lihat Bukti
                      </button>
                    )}

                    <button
                      onClick={() => handleQuickVerify(order)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#166534',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                      }}
                    >
                      <CheckCircle size={14} /> Verifikasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Manage Payment Settings */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <CreditCard size={18} color="var(--gold-600)" /> Rekening & Saluran Pembayaran
            </h2>
            <button
              onClick={handleOpenAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'var(--brown-900)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Tambah Saluran
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {settings.map(setting => (
              <div
                key={setting.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: setting.active ? 'var(--cream-100)' : '#F9FAFB',
                  border: '1px solid var(--cream-300)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b style={{ color: 'var(--brown-900)', fontSize: '14px' }}>
                      {setting.bankName || setting.accountName}
                    </b>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        backgroundColor: setting.active ? '#DCFCE7' : '#F3F4F6',
                        color: setting.active ? '#15803D' : '#6B7280',
                      }}
                    >
                      {setting.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--brown-700)', marginTop: '6px' }}>
                    {setting.type === 'bank_transfer' ? (
                      <>
                        No. Rek: <code style={{ backgroundColor: 'var(--cream-200)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{setting.accountNumber || '-'}</code>
                        {setting.accountHolder && <span> a.n. <b>{setting.accountHolder}</b></span>}
                      </>
                    ) : setting.type === 'qris' ? (
                      <div>
                        <span>QRIS Resmi Toko (Scan e-wallet / mobile banking)</span>
                        {setting.qrisImageUrl && (
                          <div style={{ marginTop: '6px' }}>
                            <img
                              src={setting.qrisImageUrl}
                              alt="QRIS Toko"
                              style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid var(--cream-300)', borderRadius: '4px', backgroundColor: '#FFF' }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>Pembayaran Tunai saat Serah Terima Pesanan</span>
                    )}
                  </div>

                  {setting.instructions && (
                    <div style={{ fontSize: '11px', color: 'var(--brown-600)', marginTop: '4px', fontStyle: 'italic' }}>
                      {setting.instructions}
                    </div>
                  )}

                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEdit(setting)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--cream-300)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        color: 'var(--brown-800)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <Edit2 size={12} /> Edit Rekening / Saluran
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleSetting(setting)}
                  title={setting.active ? 'Klik untuk Nonaktifkan' : 'Klik untuk Aktifkan'}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: setting.active ? 'var(--success-500)' : 'var(--brown-400)',
                    padding: 0,
                    marginTop: '2px',
                  }}
                >
                  {setting.active ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit / Add Payment Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '17px', color: 'var(--brown-900)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--gold-600)" />
                {editingId ? 'Edit Rekening / Saluran Pembayaran' : 'Tambah Rekening / Saluran Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                  Tipe Saluran Pembayaran
                </label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--cream-300)',
                    fontSize: '13px',
                    backgroundColor: '#FFF',
                  }}
                >
                  <option value="bank_transfer">Transfer Bank (SeaBank, BRI, Mandiri, dll.)</option>
                  <option value="qris">QRIS (Scan Barcode Toko)</option>
                  <option value="cod">Bayar Tunai / COD</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                  Nama Bank / Saluran *
                </label>
                <input
                  type="text"
                  value={formAccountName}
                  onChange={e => {
                    setFormAccountName(e.target.value);
                    setFormBankName(e.target.value);
                  }}
                  placeholder="Contoh: Bank SeaBank, Bank BRI, Bank Mandiri"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--cream-300)',
                    fontSize: '13px',
                  }}
                />
              </div>

              {formType !== 'cod' && formType !== 'qris' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                      Nomor Rekening / Akun
                    </label>
                    <input
                      type="text"
                      value={formAccountNumber}
                      onChange={e => setFormAccountNumber(e.target.value)}
                      placeholder="Contoh: 9019 1234 5678"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--cream-300)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                      Atas Nama (Pemilik Rekening)
                    </label>
                    <input
                      type="text"
                      value={formAccountHolder}
                      onChange={e => setFormAccountHolder(e.target.value)}
                      placeholder="Contoh: Bintang Cake & Cookies"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--cream-300)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </>
              )}

              {formType === 'qris' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                    Foto / Gambar Barcode QRIS Toko
                  </label>
                  {formQrisUrl && (
                    <div style={{ marginBottom: '8px' }}>
                      <img
                        src={formQrisUrl}
                        alt="QRIS Preview"
                        style={{ width: '120px', height: '120px', objectFit: 'contain', border: '1px solid var(--cream-300)', borderRadius: '6px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadQris}
                    style={{ fontSize: '12px' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--brown-500)', marginTop: '4px' }}>
                    Unggah gambar kode QRIS resmi toko Anda. Gambar otomatis dikompresi agar hemat memori.
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', marginBottom: '4px' }}>
                  Petunjuk untuk Pelanggan (Instruksi)
                </label>
                <textarea
                  value={formInstructions}
                  onChange={e => setFormInstructions(e.target.value)}
                  placeholder="Contoh: Transfer tepat sesuai total pesanan, lalu upload bukti transfer pada halaman selesai."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--cream-300)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="formActive" style={{ fontSize: '13px', color: 'var(--brown-900)', cursor: 'pointer' }}>
                  Aktifkan saluran ini pada pilihan pembayaran checkout pelanggan
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--cream-300)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--brown-700)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--brown-900)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={14} /> Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {selectedProof && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setSelectedProof(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '12px' }}>
              Bukti Pembayaran Pelanggan
            </h3>
            <img
              src={selectedProof}
              alt="Bukti Transfer"
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
            />
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => setSelectedProof(null)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--text-on-dark)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
