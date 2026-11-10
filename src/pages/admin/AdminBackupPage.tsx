import React, { useState } from 'react';
import { Database, Download, Upload, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { LocalStorageService } from '@/services/storage/localStorage';
import { initializeSeedData } from '@/services/repositories';
import { useToast } from '@/app/providers/ToastContext';

export const AdminBackupPage: React.FC = () => {
  const { addToast } = useToast();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<string | null>(null);

  // 1. Export JSON Backup
  const handleExportBackup = () => {
    try {
      const keys = [
        'categories',
        'products',
        'orders',
        'customers',
        'reviews',
        'chatMessages',
        'stockAdjustments',
        'paymentSettings',
        'deliveryAreas',
        'storeSettings',
        'content',
        'gallery',
        'adminUsers',
        'counters',
      ];

      const backupObj: Record<string, any> = {
        app: 'Bintang Cake & Cookies MVP',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {},
      };

      keys.forEach(k => {
        backupObj.data[k] = LocalStorageService.getItem(k as any, undefined, null);
      });

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bintang-cake-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('File cadangan (backup JSON) berhasil diunduh!', 'success');
    } catch (err) {
      addToast('Gagal membuat backup data.', 'error');
    }
  };

  // 2. Select file for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.data || typeof parsed.data !== 'object') {
          addToast('Format file JSON tidak valid atau bukan backup Bintang Cake.', 'error');
          return;
        }
        setRestoreData(text);
        setRestoreModalOpen(true);
      } catch (err) {
        addToast('File bukan format JSON yang valid.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Confirm Restore
  const handleConfirmRestore = () => {
    if (!restoreData) return;
    try {
      const parsed = JSON.parse(restoreData);
      Object.entries(parsed.data).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          LocalStorageService.setItem(key as any, val);
        }
      });
      addToast('Data berhasil dipulihkan! Halaman akan dimuat ulang...', 'success');
      setRestoreModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      addToast('Gagal memulihkan data dari file.', 'error');
    }
  };

  // 3. Reset to default demo seed data
  const handleResetToSeed = () => {
    try {
      initializeSeedData(true);
      addToast('Seluruh data berhasil dikembalikan ke data awal demo!', 'success');
      setResetModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      addToast('Gagal melakukan reset data.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Backup & Restore Data Toko
        </h1>
        <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
          Cadangkan seluruh data LocalStorage toko ke file JSON, pulihkan data, atau reset ke contoh demo.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card 1: Export Backup */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--cream-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-900)', flexShrink: 0 }}>
              <Download size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '4px' }}>
                Unduh Cadangan Lengkap (JSON)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '16px', lineHeight: '1.5' }}>
                Simpan semua produk, kategori, riwayat pesanan, chat, ulasan, tarif pengiriman, dan pengaturan website ke satu file JSON di komputer Anda.
              </p>
              <button
                onClick={handleExportBackup}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--gold-500)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Download size={16} /> Unduh Backup JSON
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Restore from JSON */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--cream-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-900)', flexShrink: 0 }}>
              <Upload size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '4px' }}>
                Pulihkan Data dari File JSON (Restore)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '16px', lineHeight: '1.5' }}>
                Unggah file cadangan JSON yang pernah Anda unduh sebelumnya. Data saat ini akan diperbarui sesuai isi file cadangan.
              </p>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: 'var(--cream-100)',
                  border: '1px solid var(--cream-300)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--brown-900)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={16} /> Pilih File Cadangan (.json)
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Danger Zone - Reset to Demo Seed */}
        <div style={{ backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid #FCA5A5' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-500)', flexShrink: 0 }}>
              <ShieldAlert size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '16px', color: '#991B1B', marginBottom: '4px' }}>
                Kembalikan ke Contoh Data Awal Demo
              </h2>
              <p style={{ fontSize: '13px', color: '#7F1D1D', marginBottom: '16px', lineHeight: '1.5' }}>
                Tindakan ini akan menghapus semua pesanan, riwayat chat, dan modifikasi produk yang pernah Anda buat, lalu mengisinya kembali dengan data bawaan katalog dan rekening demo.
              </p>
              <button
                onClick={() => setResetModalOpen(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--danger-500)',
                  color: '#FFFFFF',
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
                <RotateCcw size={16} /> Reset ke Data Bawaan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {restoreModalOpen && (
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
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '8px' }}>
              Konfirmasi Pemulihan Data
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--brown-700)', marginBottom: '20px', lineHeight: '1.5' }}>
              Data toko saat ini akan ditimpa dengan data dari file cadangan yang dipilih. Apakah Anda yakin ingin melanjutkan?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => {
                  setRestoreModalOpen(false);
                  setRestoreData(null);
                }}
                style={{ padding: '8px 16px', backgroundColor: 'var(--cream-200)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRestore}
                style={{ padding: '8px 18px', backgroundColor: 'var(--brown-900)', color: 'var(--text-on-dark)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Ya, Pulihkan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
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
            <h3 style={{ fontSize: '18px', color: 'var(--danger-500)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Reset Seluruh Data?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--brown-700)', marginBottom: '20px', lineHeight: '1.5' }}>
              Semua data transaksi, modifikasi produk, dan obrolan akan dihapus dan diganti dengan katalog demo awal. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setResetModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--cream-200)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleResetToSeed}
                style={{ padding: '8px 18px', backgroundColor: 'var(--danger-500)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Konfirmasi Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
