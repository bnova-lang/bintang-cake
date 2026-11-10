import React, { useState, useEffect } from 'react';
import { Truck, Plus, Check, Edit2, Trash2, MapPin, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { repos } from '@/services/repositories';
import { DeliveryArea } from '@/types';
import { formatRupiah } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminShippingPage: React.FC = () => {
  const { addToast } = useToast();
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState<number>(0);
  const [editHours, setEditHours] = useState<string>('');

  // Add new area modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState<number>(15000);
  const [newHours, setNewHours] = useState('2-3 jam');

  const loadAreas = () => {
    setAreas(repos.settings.getDeliveryAreas());
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleStartEdit = (area: DeliveryArea) => {
    setEditingId(area.id);
    setEditFee(area.fee);
    setEditHours(area.estimatedHours || area.estimatedTime || '1-2 jam');
  };

  const handleSaveEdit = (area: DeliveryArea) => {
    const updated: DeliveryArea = {
      ...area,
      fee: Math.max(0, editFee),
      estimatedHours: editHours.trim() || '1-2 jam',
    };
    repos.settings.saveDeliveryArea(updated);
    setEditingId(null);
    addToast(`Tarif wilayah ${area.name} berhasil diperbarui.`, 'success');
    loadAreas();
  };

  const handleToggleArea = (area: DeliveryArea) => {
    const updated: DeliveryArea = { ...area, active: !area.active };
    repos.settings.saveDeliveryArea(updated);
    addToast(`Wilayah ${area.name} ${updated.active ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
    loadAreas();
  };

  const handleCreateArea = () => {
    if (!newName.trim()) {
      addToast('Nama wilayah harus diisi.', 'warning');
      return;
    }
    const newArea: DeliveryArea = {
      id: 'area-' + Date.now(),
      name: newName.trim(),
      fee: Math.max(0, newFee),
      estimatedHours: newHours.trim() || '2-3 jam',
      active: true,
    };
    repos.settings.saveDeliveryArea(newArea);
    addToast(`Wilayah "${newArea.name}" berhasil ditambahkan!`, 'success');
    setNewModalOpen(false);
    setNewName('');
    setNewFee(15000);
    setNewHours('2-3 jam');
    loadAreas();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
            Tarif & Wilayah Pengiriman
          </h1>
          <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
            Kelola tarif kurir toko untuk seluruh kecamatan dan area di Balikpapan (WITA).
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--brown-900)',
            color: 'var(--text-on-dark)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={16} /> Tambah Wilayah
        </button>
      </div>

      {/* Info notice about delivery methods */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={22} color="var(--gold-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: 'var(--brown-700)', lineHeight: '1.5' }}>
          <b>Aturan Pengiriman Toko:</b>
          <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
            <li><b>Ambil di Toko:</b> Gratis ongkos kirim (Rp 0), pelanggan mengambil langsung di outlet Jl. Martadinata No. 12, Balikpapan Tengah.</li>
            <li><b>Kurir Toko:</b> Menggunakan flat tarif per wilayah kecamatan di bawah. Estimasi waktu pengiriman disesuaikan dengan jadwal kurir internal.</li>
            <li><b>GoSend / GrabExpress:</b> Ongkos kirim dihitung manual oleh admin atau dibayar langsung oleh pelanggan ke driver saat penjemputan.</li>
          </ul>
        </div>
      </div>

      {/* Areas Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-800)', borderBottom: '1px solid var(--cream-300)' }}>
              <th style={{ padding: '12px 16px' }}>Nama Wilayah / Kecamatan</th>
              <th style={{ padding: '12px 16px' }}>Tarif Ongkir (Rp)</th>
              <th style={{ padding: '12px 16px' }}>Estimasi Waktu</th>
              <th style={{ padding: '12px 16px' }}>Status Aktif</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id} style={{ borderBottom: '1px solid var(--cream-200)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="var(--brown-500)" />
                    <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>{area.name}</span>
                  </div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  {editingId === area.id ? (
                    <input
                      type="number"
                      value={editFee}
                      onChange={e => setEditFee(Number(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--cream-300)',
                        width: '120px',
                        fontSize: '13px',
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                      {formatRupiah(area.fee)}
                    </span>
                  )}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  {editingId === area.id ? (
                    <input
                      type="text"
                      value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--cream-300)',
                        width: '120px',
                        fontSize: '13px',
                      }}
                    />
                  ) : (
                    <span style={{ color: 'var(--brown-600)' }}>{area.estimatedHours}</span>
                  )}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleToggleArea(area)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: area.active ? 'var(--success-500)' : 'var(--brown-400)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {area.active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                  </button>
                </td>

                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {editingId === area.id ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleSaveEdit(area)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#166534',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={14} /> Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'var(--cream-200)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(area)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--cream-100)',
                        border: '1px solid var(--cream-300)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--brown-800)',
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Area Modal */}
      {newModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '16px' }}>
              Tambah Wilayah Pengiriman Baru
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Nama Wilayah / Kecamatan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Balikpapan Baru / Sepinggan Pratama"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Tarif Ongkir (Rupiah) *
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 15000"
                  value={newFee}
                  onChange={e => setNewFee(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Estimasi Waktu Pengiriman
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2-3 jam"
                  value={newHours}
                  onChange={e => setNewHours(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setNewModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--cream-200)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleCreateArea}
                style={{ padding: '8px 18px', backgroundColor: 'var(--brown-900)', color: 'var(--text-on-dark)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Simpan Wilayah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
