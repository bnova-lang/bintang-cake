import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Package, Heart, LogOut, Plus, Trash2, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';
import { repos } from '@/services/repositories';
import { formatRupiah, formatDateWITA } from '@/utils/format';
import { Address } from '@/types';

export const AccountPage: React.FC = () => {
  const { customer, logout, refreshCustomer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // New address state
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [addrLabel, setAddrLabel] = useState<string>('Rumah');
  const [addrRecipient, setAddrRecipient] = useState<string>(customer?.name || '');
  const [addrPhone, setAddrPhone] = useState<string>(customer?.whatsapp || '');
  const [addrLine, setAddrLine] = useState<string>('');

  // Profile Edit State
  const [name, setName] = useState<string>(customer?.name || '');
  const [email, setEmail] = useState<string>(customer?.email || '');

  // Review Modal State
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  if (!customer) {
    navigate('/masuk');
    return null;
  }

  const customerOrders = useMemo(() => {
    return repos.orderRepo.getAll().filter(o => o.customerId === customer.id || o.customerWhatsapp === customer.whatsapp);
  }, [customer]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    customer.name = name.trim();
    customer.email = email.trim() || undefined;
    customer.updatedAt = new Date().toISOString();
    repos.customerRepo.save(customer);
    refreshCustomer();
    showToast('Profil berhasil diperbarui!', 'success');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine.trim()) return;

    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      label: addrLabel,
      recipientName: addrRecipient.trim(),
      phone: addrPhone.trim(),
      addressLine: addrLine.trim(),
      isDefault: customer.addressBook.length === 0,
    };

    customer.addressBook.push(newAddr);
    repos.customerRepo.save(customer);
    refreshCustomer();
    setShowAddAddress(false);
    setAddrLine('');
    showToast('Alamat baru tersimpan!', 'success');
  };

  const handleDeleteAddress = (id: string) => {
    customer.addressBook = customer.addressBook.filter(a => a.id !== id);
    repos.customerRepo.save(customer);
    refreshCustomer();
    showToast('Alamat dihapus.', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    customer.addressBook.forEach(a => {
      a.isDefault = a.id === id;
    });
    repos.customerRepo.save(customer);
    refreshCustomer();
    showToast('Alamat utama diperbarui.', 'success');
  };

  const handleOpenReview = (orderId: string, productId: string) => {
    setReviewOrderId(orderId);
    setReviewProductId(productId);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId || !reviewProductId || !reviewComment.trim()) return;

    repos.reviewRepo.add({
      orderId: reviewOrderId,
      customerId: customer.id,
      customerName: customer.name,
      productId: reviewProductId,
      rating: reviewRating as 1 | 2 | 3 | 4 | 5,
      comment: reviewComment.trim(),
      isHidden: false,
    });

    showToast('Terima kasih! Ulasan Anda berhasil dikirim.', 'success');
    setReviewOrderId(null);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '860px' }}>
      {/* Account Header */}
      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 32px',
          border: '1px solid var(--cream-300)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
              {customer.name}
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              WhatsApp: {customer.whatsapp} {customer.email ? `• ${customer.email}` : ''}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            backgroundColor: 'var(--cream-200)',
            color: 'var(--danger-600)',
            border: '1px solid var(--cream-300)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          <span>Keluar Akun</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--cream-300)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? 'var(--brown-900)' : 'var(--text-muted)',
            borderBottom: activeTab === 'orders' ? '3px solid var(--gold-600)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Package size={16} />
          <span>Riwayat Pesanan ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: activeTab === 'addresses' ? 700 : 500,
            color: activeTab === 'addresses' ? 'var(--brown-900)' : 'var(--text-muted)',
            borderBottom: activeTab === 'addresses' ? '3px solid var(--gold-600)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MapPin size={16} />
          <span>Buku Alamat ({customer.addressBook.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: activeTab === 'profile' ? 700 : 500,
            color: activeTab === 'profile' ? 'var(--brown-900)' : 'var(--text-muted)',
            borderBottom: activeTab === 'profile' ? '3px solid var(--gold-600)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <User size={16} />
          <span>Pengaturan Profil</span>
        </button>
      </div>

      {/* Tab 1: Riwayat Pesanan */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {customerOrders.length > 0 ? (
            customerOrders.map(order => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--ivory-50)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--cream-300)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{formatDateWITA(order.createdAt)}</span>
                    <b style={{ fontSize: '15px', color: 'var(--brown-900)' }}>{order.orderNumber}</b>
                  </div>
                  <span
                    style={{
                      backgroundColor: order.orderStatus === 'selesai' ? 'var(--success-100)' : 'var(--warning-100)',
                      color: order.orderStatus === 'selesai' ? 'var(--success-600)' : 'var(--warning-600)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', fontSize: '13px' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantity}x {item.productName} ({item.variantName})</span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--cream-200)' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Tagihan: </span>
                    <b style={{ color: 'var(--brown-900)' }}>{formatRupiah(order.totalAmount)}</b>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.orderStatus === 'selesai' && order.items.length > 0 && (
                      <button
                        onClick={() => handleOpenReview(order.id, order.items[0].productId)}
                        style={{
                          backgroundColor: 'var(--gold-100)',
                          color: 'var(--brown-900)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Beri Ulasan
                      </button>
                    )}
                    <Link
                      to={`/lacak-pesanan?order=${order.orderNumber}&wa=${order.customerWhatsapp}`}
                      style={{
                        backgroundColor: 'var(--brown-800)',
                        color: 'var(--text-on-dark)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Detail & Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
              Belum ada riwayat pesanan. Mulai belanja kue sekarang!
            </p>
          )}
        </div>
      )}

      {/* Tab 2: Buku Alamat */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)' }}>Daftar Alamat Pengiriman</h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              style={{
                backgroundColor: 'var(--gold-500)',
                color: 'var(--brown-900)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} />
              <span>Tambah Alamat</span>
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} style={{ backgroundColor: 'var(--ivory-50)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cream-300)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--brown-900)', marginBottom: '12px' }}>Tambah Alamat Baru</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Label Alamat</label>
                  <input type="text" required value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Rumah / Kantor" style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Nama Penerima</label>
                  <input type="text" required value={addrRecipient} onChange={e => setAddrRecipient(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Nomor Telepon</label>
                  <input type="tel" required value={addrPhone} onChange={e => setAddrPhone(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Alamat Lengkap</label>
                <textarea required value={addrLine} onChange={e => setAddrLine(e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW..." style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', minHeight: '60px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '13px' }}>Simpan Alamat</button>
                <button type="button" onClick={() => setShowAddAddress(false)} style={{ backgroundColor: 'var(--cream-200)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>Batal</button>
              </div>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {customer.addressBook.map(addr => (
              <div key={addr.id} style={{ backgroundColor: 'var(--ivory-50)', padding: '16px', borderRadius: 'var(--radius-lg)', border: addr.isDefault ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <b style={{ fontSize: '14px', color: 'var(--brown-900)' }}>{addr.label}</b>
                  {addr.isDefault && <span style={{ fontSize: '11px', backgroundColor: 'var(--gold-100)', color: 'var(--brown-900)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>Utama</span>}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}><b>{addr.recipientName}</b> ({addr.phone})</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>{addr.addressLine}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefaultAddress(addr.id)} style={{ fontSize: '12px', color: 'var(--brown-800)', fontWeight: 600 }}>Jadikan Utama</button>
                  )}
                  <button onClick={() => handleDeleteAddress(addr.id)} style={{ color: 'var(--danger-600)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Pengaturan Profil */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', maxWidth: '480px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Ubah Profil</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nama Lengkap</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nomor WhatsApp (Terkunci)</label>
              <input type="text" disabled value={customer.whatsapp} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: 'var(--cream-200)' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
            </div>
            <button type="submit" style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '14px', marginTop: '8px' }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* Review Modal */}
      {reviewOrderId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <form onSubmit={handleSubmitReview} style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-xl)', padding: '24px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>Beri Ulasan Kue</h3>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{ color: star <= reviewRating ? 'var(--gold-500)' : 'var(--cream-300)', cursor: 'pointer' }}
                >
                  <Star size={24} fill={star <= reviewRating ? 'var(--gold-500)' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              required
              rows={4}
              placeholder="Ceritakan rasa, kerenyahan, dan pengalaman pesanan Anda..."
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', marginBottom: '16px', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setReviewOrderId(null)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Batal</button>
              <button type="submit" style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '8px 20px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>Kirim Ulasan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
