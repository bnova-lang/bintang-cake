import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  Sparkles,
  Award,
  Gift,
  Megaphone,
  HardDrive,
  Zap,
  CheckCircle2,
  Folder,
  Cookie,
  ArrowUpRight,
  ExternalLink,
  Sliders,
  MoveUp,
  MoveDown,
  Eye,
  Check,
  X,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { repos } from '@/services/repositories';
import { Content, GalleryItem, Category, Product, BannerItem } from '@/types';
import { useToast } from '@/app/providers/ToastContext';
import { formatRupiah } from '@/utils/format';
import { indexedDBStorage, StorageCapacity } from '@/services/storage/indexedDB';
import { LocalStorageService } from '@/services/storage/localStorage';

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'cat-cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  'cat-cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
  'cat-lidah': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
  'cat-lapis': 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80',
  'cat-hampers': 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80',
  'cat-custom': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
};

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  'prod-nastar-wisman': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
  'prod-kastengel-edam': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'prod-bolu-gulung-keju': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
  'prod-lapis-legit-prunes': 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=800&auto=format&fit=crop&q=80',
};

export const AdminContentPage: React.FC = () => {
  const { addToast } = useToast();
  const [content, setContent] = useState<Content | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catUrlInputs, setCatUrlInputs] = useState<Record<string, string>>({});
  const [prodUrlInputs, setProdUrlInputs] = useState<Record<string, string>>({});

  // New gallery item state
  const [newGalleryOpen, setNewGalleryOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState('');

  // Banner slider management state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerButtonText, setBannerButtonText] = useState('Lihat Seluruh Produk');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('/produk');
  const [bannerActive, setBannerActive] = useState(true);

  const loadData = () => {
    setContent(repos.settings.getContent());
    setGallery(repos.settings.getGallery());
    setCategories(repos.categoryRepo.getAll());
    setProducts(repos.productRepo.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    repos.settings.saveContent(content);
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast('Konten, foto header & banner hampers berhasil disimpan!', 'success');
  };

  // Upload & Compress Hero Image
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa file gambar (JPG/PNG/WEBP).', 'warning');
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);

        setContent({
          ...content,
          heroImageUrl: compressedDataUrl,
        });
        addToast('Foto header berhasil dimuat & dikompresi. Jangan lupa klik tombol Simpan.', 'info');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetHeroImage = () => {
    if (!content) return;
    setContent({
      ...content,
      heroImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    });
    addToast('Foto header diatur kembali ke foto bawaan.', 'info');
  };

  // Upload & Compress Hampers Banner Image
  const handleHampersImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa file gambar (JPG/PNG/WEBP).', 'warning');
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
          h = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);

        setContent({
          ...content,
          hampersBannerImageUrl: compressedDataUrl,
        });
        addToast('Foto banner hampers berhasil dimuat & dikompresi. Jangan lupa klik tombol Simpan.', 'info');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetHampersImage = () => {
    if (!content) return;
    setContent({
      ...content,
      hampersBannerImageUrl: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80',
    });
    addToast('Foto banner hampers diatur kembali ke foto bawaan.', 'info');
  };

  const handleApplyTickerTemplate = (type: 'natal' | 'lebaran' | 'imlek' | 'gold') => {
    if (!content) return;
    switch (type) {
      case 'natal':
        setContent({
          ...content,
          tickerActive: true,
          tickerTheme: 'natal',
          tickerBadge: '🎄 SPESIAL NATAL & TAHUN BARU',
          tickerText:
            '🎄 Promo Spesial Natal & Tahun Baru Bintang Cake: Buka Pre-Order Paket Hampers Eksklusif & Cake Hantaran Mewah! Hubungi WhatsApp untuk amankan slot Anda • Dipanggang segar setiap hari dengan 100% Butter Wijsman • Pengiriman Samarinda & Balikpapan',
          tickerSpeed: 'medium',
          tickerLink: '/spesial',
        });
        addToast('Template Promo Natal berhasil dimuat! Klik Simpan untuk menerapkan.', 'info');
        break;
      case 'lebaran':
        setContent({
          ...content,
          tickerActive: true,
          tickerTheme: 'lebaran',
          tickerBadge: '🌙 SPESIAL LEBARAN & IDUL FITRI',
          tickerText:
            '🌙 Spesial Hari Raya Idul Fitri: Paket Hampers Nastar Keju Wijsman, Kastengel Renyah & Lapis Legit Spekkoek siap diantar! Pesan lebih awal sebelum kuota penuh • Toples kemasan aman bersegel',
          tickerSpeed: 'medium',
          tickerLink: '/spesial',
        });
        addToast('Template Promo Lebaran berhasil dimuat! Klik Simpan untuk menerapkan.', 'info');
        break;
      case 'imlek':
        setContent({
          ...content,
          tickerActive: true,
          tickerTheme: 'imlek',
          tickerBadge: '🧧 SPESIAL IMLEK & HARI RAYA',
          tickerText:
            '🧧 Spesial Tahun Baru Imlek: Nikmati Manisnya Lapis Legit Wijsman & Aneka Cookies Keberuntungan untuk Keluarga Tercinta! Hubungi WhatsApp untuk pemesanan slot hampers eksklusif',
          tickerSpeed: 'medium',
          tickerLink: '/spesial',
        });
        addToast('Template Promo Imlek berhasil dimuat! Klik Simpan untuk menerapkan.', 'info');
        break;
      case 'gold':
      default:
        setContent({
          ...content,
          tickerActive: true,
          tickerTheme: 'gold',
          tickerBadge: '✨ PROMO SPESIAL TOKO',
          tickerText:
            '✨ Buka Setiap Hari: 08.00 - 20.00 WITA • Nikmati Kelezatan Cake, Cookies, dan Hampers Eksklusif Bintang Cake & Cookies • Pengiriman Wilayah Samarinda & Balikpapan',
          tickerSpeed: 'medium',
          tickerLink: '/produk',
        });
        addToast('Template Promo Reguler berhasil dimuat!', 'info');
        break;
    }
  };

  // Universal Image Compressor with HTML5 Canvas (lightweight & crisp)
  const compressImageFile = (file: File, maxDim: number, quality = 0.70): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Format berkas harus berupa gambar'));
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = ev.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas'));
      reader.readAsDataURL(file);
    });
  };

  // Banner Slider Handlers
  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBadge('Panggangan Segar Dapur Samarinda');
    setBannerImage('');
    setBannerButtonText('Lihat Seluruh Produk');
    setBannerLinkUrl('/produk');
    setBannerActive(true);
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title || '');
    setBannerSubtitle(b.subtitle || '');
    setBannerBadge(b.badge || '');
    setBannerImage(b.imageUrl || '');
    setBannerButtonText(b.buttonText || 'Lihat Seluruh Produk');
    setBannerLinkUrl(b.linkUrl || '/produk');
    setBannerActive(b.active !== false);
    setBannerModalOpen(true);
  };

  const handleSaveBannerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    if (!bannerImage) {
      addToast('Foto banner wajib diunggah atau diisi URL-nya.', 'warning');
      return;
    }
    if (!bannerTitle.trim()) {
      addToast('Judul banner wajib diisi.', 'warning');
      return;
    }

    const currentBanners = [...(content.banners || [])];

    if (editingBannerId) {
      const updatedBanners = currentBanners.map(b =>
        b.id === editingBannerId
          ? {
              ...b,
              title: bannerTitle.trim(),
              subtitle: bannerSubtitle.trim(),
              badge: bannerBadge.trim(),
              imageUrl: bannerImage,
              buttonText: bannerButtonText.trim(),
              linkUrl: bannerLinkUrl.trim() || '/produk',
              active: bannerActive,
            }
          : b
      );
      const updatedContent = { ...content, banners: updatedBanners };
      setContent(updatedContent);
      repos.settings.saveContent(updatedContent);
      window.dispatchEvent(new Event('bcc-settings-updated'));
      addToast('Slide banner berhasil diperbarui!', 'success');
    } else {
      const newBanner: BannerItem = {
        id: 'banner-' + Date.now(),
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        badge: bannerBadge.trim(),
        imageUrl: bannerImage,
        buttonText: bannerButtonText.trim(),
        linkUrl: bannerLinkUrl.trim() || '/produk',
        active: bannerActive,
        sortOrder: currentBanners.length + 1,
      };
      const updatedContent = { ...content, banners: [...currentBanners, newBanner] };
      setContent(updatedContent);
      repos.settings.saveContent(updatedContent);
      window.dispatchEvent(new Event('bcc-settings-updated'));
      addToast('Slide banner baru berhasil ditambahkan!', 'success');
    }

    setBannerModalOpen(false);
  };

  const handleDeleteBanner = (id: string) => {
    if (!content) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus slide banner ini?')) return;
    const updatedBanners = (content.banners || []).filter(b => b.id !== id);
    const updatedContent = { ...content, banners: updatedBanners };
    setContent(updatedContent);
    repos.settings.saveContent(updatedContent);
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast('Slide banner berhasil dihapus!', 'info');
  };

  const handleToggleBannerActive = (id: string) => {
    if (!content) return;
    const updatedBanners = (content.banners || []).map(b =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    const updatedContent = { ...content, banners: updatedBanners };
    setContent(updatedContent);
    repos.settings.saveContent(updatedContent);
    window.dispatchEvent(new Event('bcc-settings-updated'));
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (!content) return;
    const list = [...(content.banners || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    const updatedContent = { ...content, banners: list };
    setContent(updatedContent);
    repos.settings.saveContent(updatedContent);
    window.dispatchEvent(new Event('bcc-settings-updated'));
  };

  const handleBannerModalImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      setBannerImage(compressed);
      addToast('Foto banner berhasil diunggah & dikompresi otomatis!', 'info');
    } catch {
      addToast('Gagal memproses gambar. Pastikan format file adalah JPG/PNG.', 'error');
    }
  };

  const handleDirectBannerImageUpload = async (bannerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      const updatedBanners = (content.banners || []).map(b =>
        b.id === bannerId ? { ...b, imageUrl: compressed } : b
      );
      const updatedContent = { ...content, banners: updatedBanners };
      setContent(updatedContent);
      repos.settings.saveContent(updatedContent);
      window.dispatchEvent(new Event('bcc-settings-updated'));
      addToast('Foto banner berhasil diganti seketika!', 'success');
    } catch {
      addToast('Gagal mengganti foto banner.', 'error');
    }
  };

  // Category Photo Handlers
  const handleUploadCategoryImage = async (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 600, 0.82);
      const cat = categories.find(c => c.id === catId);
      if (!cat) return;
      const updated: Category = { ...cat, image: compressed };
      repos.categoryRepo.save(updated);
      setCategories(prev => prev.map(c => c.id === catId ? updated : c));
      window.dispatchEvent(new Event('bcc-categories-updated'));
      window.dispatchEvent(new Event('bcc-settings-updated'));
      addToast(`Foto kategori "${cat.name}" berhasil diunggah & disimpan!`, 'success');
    } catch {
      addToast('Gagal memproses gambar kategori. Pastikan format JPG/PNG/WEBP.', 'error');
    }
  };

  const handleResetCategoryImage = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const defaultImg = DEFAULT_CATEGORY_IMAGES[catId] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
    const updated: Category = { ...cat, image: defaultImg };
    repos.categoryRepo.save(updated);
    setCategories(prev => prev.map(c => c.id === catId ? updated : c));
    window.dispatchEvent(new Event('bcc-categories-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(`Foto kategori "${cat.name}" diatur kembali ke foto bawaan.`, 'info');
  };

  const handleApplyCategoryUrl = (catId: string) => {
    const url = catUrlInputs[catId];
    if (!url || !url.trim()) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const updated: Category = { ...cat, image: url.trim() };
    repos.categoryRepo.save(updated);
    setCategories(prev => prev.map(c => c.id === catId ? updated : c));
    window.dispatchEvent(new Event('bcc-categories-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(`URL foto kategori "${cat.name}" berhasil disimpan!`, 'success');
  };

  // Product Photo Handlers ("Istimewa Hari Ini")
  const handleUploadProductImage = async (prodId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 800, 0.82);
      const prod = products.find(p => p.id === prodId);
      if (!prod) return;
      const updatedImages = prod.images && prod.images.length > 0
        ? prod.images.map((img, idx) => idx === 0 ? { ...img, url: compressed } : img)
        : [{ id: 'img-1', url: compressed, altText: prod.name, isPrimary: true }];
      const updated: Product = { ...prod, images: updatedImages };
      repos.productRepo.save(updated);
      setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
      window.dispatchEvent(new Event('bcc-products-updated'));
      window.dispatchEvent(new Event('bcc-settings-updated'));
      addToast(`Foto produk "${prod.name}" berhasil diunggah & disimpan!`, 'success');
    } catch {
      addToast('Gagal memproses gambar produk. Pastikan format JPG/PNG/WEBP.', 'error');
    }
  };

  const handleResetProductImage = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const defaultImg = DEFAULT_PRODUCT_IMAGES[prodId] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80';
    const updatedImages = prod.images && prod.images.length > 0
      ? prod.images.map((img, idx) => idx === 0 ? { ...img, url: defaultImg } : img)
      : [{ id: 'img-1', url: defaultImg, altText: prod.name, isPrimary: true }];
    const updated: Product = { ...prod, images: updatedImages };
    repos.productRepo.save(updated);
    setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
    window.dispatchEvent(new Event('bcc-products-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(`Foto produk "${prod.name}" dikembalikan ke foto awal.`, 'info');
  };

  const handleApplyProductUrl = (prodId: string) => {
    const url = prodUrlInputs[prodId];
    if (!url || !url.trim()) return;
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const updatedImages = prod.images && prod.images.length > 0
      ? prod.images.map((img, idx) => idx === 0 ? { ...img, url: url.trim() } : img)
      : [{ id: 'img-1', url: url.trim(), altText: prod.name, isPrimary: true }];
    const updated: Product = { ...prod, images: updatedImages };
    repos.productRepo.save(updated);
    setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
    window.dispatchEvent(new Event('bcc-products-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(`URL foto produk "${prod.name}" berhasil disimpan!`, 'success');
  };

  const handleToggleFeatured = (prodId: string, isFeatured: boolean) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const updated: Product = { ...prod, featured: isFeatured };
    repos.productRepo.save(updated);
    setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
    window.dispatchEvent(new Event('bcc-products-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast(
      isFeatured
        ? `"${prod.name}" kini tampil di Istimewa Hari Ini!`
        : `"${prod.name}" dilepas dari Istimewa Hari Ini.`,
      'info'
    );
  };

  const [storageInfo, setStorageInfo] = useState<StorageCapacity | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    indexedDBStorage.getCapacityEstimate().then(setStorageInfo);
  }, [gallery.length]);

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImage) {
      addToast('Judul dan foto wajib diisi.', 'warning');
      return;
    }
    const newId = 'gal-' + Date.now();
    const item: GalleryItem = {
      id: newId,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Kue Ulang Tahun',
      imageUrl: newImage,
      description: '',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save to high-capacity IndexedDB
      await indexedDBStorage.setItem(newId, newImage);
      // 2. Save to LocalStorage repository
      repos.settings.saveGalleryItem(item);
      addToast('Foto berhasil ditambahkan ke galeri!', 'success');
      setNewGalleryOpen(false);
      setNewTitle('');
      setNewCategory('');
      setNewImage('');
      loadData();
      indexedDBStorage.getCapacityEstimate().then(setStorageInfo);
    } catch (err) {
      console.error('Error adding gallery item:', err);
      addToast('Gagal menyimpan foto. Silakan klik tombol "Optimalkan Memori".', 'error');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) {
      return;
    }
    try {
      await indexedDBStorage.removeItem(id);
    } catch (e) {
      console.warn('Failed to remove from indexedDB:', e);
    }
    repos.settings.deleteGalleryItem(id);
    setGallery(repos.settings.getGallery());
    window.dispatchEvent(new Event('bcc-settings-updated'));
    addToast('Foto berhasil dihapus dari galeri.', 'info');
    indexedDBStorage.getCapacityEstimate().then(setStorageInfo);
  };

  const handleGalleryImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Berkas harus berupa gambar (JPG/PNG/WEBP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 850; // Optimal dimensions for gallery
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          // Compress to lightweight high-quality JPEG (~30KB-45KB)
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setNewImage(compressed);
          addToast('Foto berhasil dikompresi otomatis (~98% lebih hemat memori)!', 'info');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOptimizeStorage = async () => {
    setOptimizing(true);
    try {
      const items = repos.settings.getGallery();
      let compressedCount = 0;

      const updated = await Promise.all(
        items.map(async item => {
          if (item.imageUrl && item.imageUrl.startsWith('data:image/') && item.imageUrl.length > 120000) {
            return new Promise<GalleryItem>(resolve => {
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
                const compressed = canvas.toDataURL('image/jpeg', 0.80);
                compressedCount++;
                resolve({ ...item, imageUrl: compressed });
              };
              img.onerror = () => resolve(item);
              img.src = item.imageUrl;
            });
          }
          return item;
        })
      );

      LocalStorageService.setItem('gallery', updated);
      loadData();
      const cap = await indexedDBStorage.getCapacityEstimate();
      setStorageInfo(cap);

      if (compressedCount > 0) {
        addToast(`Berhasil mengompresi ${compressedCount} foto galeri! Ruang penyimpanan kini jauh lebih lega.`, 'success');
      } else {
        addToast('Semua foto galeri sudah dalam ukuran optimal & hemat memori.', 'info');
      }
    } catch {
      addToast('Terjadi kendala saat mengoptimalkan memori.', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  if (!content) return <div>Memuat konten...</div>;

  const currentHeroImage =
    content.heroImageUrl ||
    (content.banners && content.banners[0]?.imageUrl) ||
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80';

  const currentHampersImage =
    content.hampersBannerImageUrl ||
    'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80';

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Kelola Header, Banner & Konten Website
        </h1>
        <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
          Ganti foto header hero, judul banner, teks pengumuman, cerita toko, dan foto galeri kue.
        </p>
      </div>

      {/* Quick link to Logo Management in Settings */}
      <div
        style={{
          backgroundColor: 'var(--cream-50)',
          border: '1px solid var(--cream-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="var(--gold-600)" />
          <span style={{ fontSize: '13px', color: 'var(--brown-800)' }}>
            Ingin mengubah <b>Logo Toko</b> (di sudut kiri atas Header, Footer & Invoice)?
          </span>
        </div>
        <Link
          to="/admin/pengaturan"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--brown-900)',
            backgroundColor: 'var(--gold-500)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Unggah Logo di Pengaturan Toko →
        </Link>
      </div>

      {/* Quick Jump Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xs)',
          border: '1px solid var(--cream-300)',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brown-800)', marginRight: '4px' }}>
          Lompat ke Pengaturan:
        </span>
        <a
          href="#sec-slider"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--gold-100)',
            border: '1.5px solid var(--gold-500)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
          }}
        >
          🎡 Slider Banner ({content?.banners?.length || 0})
        </a>
        <a
          href="#sec-hero"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--cream-100)',
            border: '1px solid var(--cream-300)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          🖼️ Foto Header
        </a>
        <a
          href="#sec-ticker"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--cream-100)',
            border: '1px solid var(--cream-300)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          📢 Tulisan Berjalan
        </a>
        <a
          href="#sec-categories"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--gold-100)',
            border: '1.5px solid var(--gold-500)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
          }}
        >
          📂 Foto Kategori (6)
        </a>
        <a
          href="#sec-featured"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--gold-100)',
            border: '1.5px solid var(--gold-500)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
          }}
        >
          🍰 Produk Istimewa
        </a>
        <a
          href="#sec-hampers"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--cream-100)',
            border: '1px solid var(--cream-300)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          🎁 Banner Hampers
        </a>
        <a
          href="#sec-about"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--cream-100)',
            border: '1px solid var(--cream-300)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          📖 Cerita Toko
        </a>
        <a
          href="#sec-gallery"
          style={{
            fontSize: '12px',
            color: 'var(--brown-900)',
            backgroundColor: 'var(--cream-100)',
            border: '1px solid var(--cream-300)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          📸 Galeri Foto
        </a>
      </div>

      <form onSubmit={handleSaveContent}>
        {/* Section 0: Hero Slider & Banner Management */}
        <div
          id="sec-slider"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px',
            border: '2px solid var(--gold-500)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid var(--cream-300)',
              paddingBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '19px',
                  color: 'var(--brown-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                <Sliders size={22} color="var(--gold-600)" /> Kelola Hero Slider & Banner Beranda ({content?.banners?.length || 0})
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--brown-600)', marginTop: '4px', display: 'block' }}>
                Ganti foto, tambah slide promo baru, atau atur slide beranda yang tampil bergantian secara otomatis.
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddBanner}
              style={{
                padding: '9px 18px',
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
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={16} /> Tambah Slide Banner Baru
            </button>
          </div>

          {/* Auto-Slide Settings Bar */}
          <div
            style={{
              backgroundColor: 'var(--cream-100)',
              border: '1px solid var(--cream-300)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)' }}>
              <input
                type="checkbox"
                checked={content?.heroSliderAutoPlay !== false}
                onChange={e => {
                  if (!content) return;
                  const updated = { ...content, heroSliderAutoPlay: e.target.checked };
                  setContent(updated);
                  repos.settings.saveContent(updated);
                  window.dispatchEvent(new Event('bcc-settings-updated'));
                }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--gold-600)' }}
              />
              <span>Putar Banner Otomatis (Auto-Slide Carousel)</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brown-800)' }}>
              <span>Pergantian Tiap:</span>
              <select
                value={content?.heroSliderInterval || 5}
                onChange={e => {
                  if (!content) return;
                  const updated = { ...content, heroSliderInterval: Number(e.target.value) };
                  setContent(updated);
                  repos.settings.saveContent(updated);
                  window.dispatchEvent(new Event('bcc-settings-updated'));
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--cream-300)',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: 'var(--brown-900)',
                }}
              >
                <option value={3}>3 Detik (Cepat)</option>
                <option value={5}>5 Detik (Normal)</option>
                <option value={7}>7 Detik (Santai)</option>
                <option value={10}>10 Detik (Lambat)</option>
              </select>
            </div>
          </div>

          {/* List of Banner Slides */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(content?.banners || []).map((b, idx) => (
              <div
                key={b.id}
                style={{
                  border: b.active ? '1.5px solid var(--cream-300)' : '1.5px dashed var(--cream-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  backgroundColor: b.active ? '#FFFFFF' : 'var(--cream-50)',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  position: 'relative',
                  opacity: b.active ? 1 : 0.75,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Banner Thumbnail with Replace Hover Overlay */}
                <div style={{ position: 'relative', width: '200px', height: '115px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--cream-300)', flexShrink: 0, backgroundColor: '#000' }}>
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'var(--gold-500)',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Slide #{idx + 1}
                  </span>

                  {/* Direct Change Photo Pill */}
                  <label
                    title="Klik untuk langsung ganti foto slide ini dari HP/komputer"
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(59, 36, 22, 0.9)',
                      color: 'var(--gold-500)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(242, 193, 78, 0.4)',
                    }}
                  >
                    <Upload size={12} /> Ganti Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleDirectBannerImageUpload(b.id, e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Banner Details */}
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {b.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--gold-600)',
                        backgroundColor: 'var(--gold-100)',
                        padding: '1px 8px',
                        borderRadius: 'var(--radius-full)',
                        width: 'fit-content',
                      }}
                    >
                      {b.badge}
                    </span>
                  )}
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)', margin: '2px 0' }}>
                    {b.title}
                  </h4>
                  {b.subtitle && (
                    <p style={{ fontSize: '12px', color: 'var(--brown-600)', margin: 0, lineHeight: 1.4 }}>
                      {b.subtitle}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Tombol: <strong>{b.buttonText || 'Lihat Seluruh Produk'}</strong></span>
                    <span>Tautan: <code style={{ backgroundColor: 'var(--cream-200)', padding: '1px 6px', borderRadius: '4px' }}>{b.linkUrl || '/produk'}</code></span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => handleMoveBanner(idx, 'up')}
                    disabled={idx === 0}
                    title="Geser ke atas / tampil lebih awal"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-300)',
                      backgroundColor: idx === 0 ? 'var(--cream-100)' : '#FFFFFF',
                      color: idx === 0 ? 'var(--brown-300)' : 'var(--brown-800)',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MoveUp size={15} />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveBanner(idx, 'down')}
                    disabled={idx === (content?.banners?.length || 0) - 1}
                    title="Geser ke bawah"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-300)',
                      backgroundColor: idx === (content?.banners?.length || 0) - 1 ? 'var(--cream-100)' : '#FFFFFF',
                      color: idx === (content?.banners?.length || 0) - 1 ? 'var(--brown-300)' : 'var(--brown-800)',
                      cursor: idx === (content?.banners?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MoveDown size={15} />
                  </button>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => handleToggleBannerActive(b.id)}
                    title={b.active ? 'Klik untuk nonaktifkan sementara' : 'Klik untuk tampilkan kembali'}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: b.active ? '1px solid var(--success-600)' : '1px solid var(--cream-300)',
                      backgroundColor: b.active ? 'var(--success-100)' : 'var(--cream-100)',
                      color: b.active ? 'var(--success-600)' : 'var(--brown-600)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {b.active ? <CheckCircle2 size={14} /> : <X size={14} />}
                    <span>{b.active ? 'Aktif' : 'Nonaktif'}</span>
                  </button>

                  {/* Edit Details */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditBanner(b)}
                    title="Ubah judul, teks, atau tautan slide"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-300)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--brown-800)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  {/* Delete Banner */}
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id)}
                    title="Hapus slide banner ini"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--danger-100)',
                      backgroundColor: 'var(--danger-100)',
                      color: 'var(--danger-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {(content?.banners || []).length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 20px',
                  backgroundColor: 'var(--cream-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--cream-300)',
                }}
              >
                <Sliders size={32} color="var(--gold-600)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brown-900)' }}>
                  Belum ada slide banner kustom
                </div>
                <p style={{ fontSize: '12px', color: 'var(--brown-600)', maxWidth: '420px', margin: '4px auto 14px' }}>
                  Tambahkan slide banner promosi dengan foto kue pesanan, edisi hampers hari raya, atau promo diskon toko Anda.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddBanner}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: 'var(--brown-900)',
                    color: 'var(--gold-500)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Tambah Slide Banner Pertama
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Hero & Header Settings */}
        <div id="sec-hero" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px' }}>
            <ImageIcon size={20} color="var(--gold-600)" /> Pengaturan Foto & Teks Header Beranda
          </h2>

          {/* Photo Management Card */}
          <div style={{ backgroundColor: 'var(--cream-100)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '8px' }}>
              Foto Utama di Dalam Header Hero
            </label>
            <p style={{ fontSize: '12px', color: 'var(--brown-600)', marginBottom: '14px' }}>
              Foto ini tampil di sebelah kanan banner sambutan beranda toko Anda. Anda bisa mengunggah foto baru dari komputer atau memasukkan URL gambar.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Photo Preview */}
              <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '3px solid var(--gold-500)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                <img
                  src={currentHeroImage}
                  alt="Pratinjau Header"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                  Pratinjau
                </span>
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: 'var(--brown-900)',
                      color: 'var(--gold-500)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Upload size={16} /> Unggah Foto Header Baru dari Komputer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--brown-500)', display: 'block', marginTop: '4px' }}>
                    Mendukung JPG, PNG, WEBP (Otomatis dikompresi agar ringan)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={content.heroImageUrl || ''}
                    onChange={e => setContent({ ...content, heroImageUrl: e.target.value })}
                    placeholder="Atau masukkan tautan URL gambar (https://...)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-300)',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleResetHeroImage}
                    title="Kembalikan ke foto bawaan"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--cream-300)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--brown-800)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Text Settings for Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Teks Badge Kecil di Atas Judul
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--gold-600)" />
                <input
                  type="text"
                  value={content.heroBadge || ''}
                  onChange={e => setContent({ ...content, heroBadge: e.target.value })}
                  placeholder="Contoh: Panggangan Segar Dapur Samarinda"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Judul Utama Header (Hero Title) *
              </label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={e => setContent({ ...content, heroTitle: e.target.value })}
                placeholder="Contoh: Partner to Enjoy Your Day"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}
              />

              {/* Font & Style Customization Box */}
              <div
                style={{
                  backgroundColor: 'var(--cream-100)',
                  border: '1px solid var(--cream-300)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
                  {/* Font Family Selector */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Pilihan Jenis Font
                    </label>
                    <select
                      value={content.heroTitleFontFamily || 'playfair'}
                      onChange={e => setContent({ ...content, heroTitleFontFamily: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--cream-300)',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    >
                      <option value="playfair">Playfair Display (Serif Mewah & Elegan)</option>
                      <option value="script">Dancing Script / Cursive (Tulisan Indah Bersambung)</option>
                      <option value="cormorant">Cormorant Garamond (Serif Butik Klasik)</option>
                      <option value="sans">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="georgia">Georgia (Serif Tradisional)</option>
                    </select>
                  </div>

                  {/* Italic & Weight Toggles */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Gaya & Ketebalan Tulisan
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          backgroundColor: content.heroTitleItalic ? 'var(--gold-500)' : '#FFFFFF',
                          color: content.heroTitleItalic ? 'var(--brown-900)' : 'var(--brown-800)',
                          border: '1px solid var(--cream-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '7px 12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          fontStyle: 'italic',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(content.heroTitleItalic)}
                          onChange={e => setContent({ ...content, heroTitleItalic: e.target.checked })}
                          style={{ accentColor: 'var(--brown-900)' }}
                        />
                        <span>Tulisan Miring (Italic)</span>
                      </label>

                      <select
                        value={content.heroTitleWeight || 'bold'}
                        onChange={e => setContent({ ...content, heroTitleWeight: e.target.value })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--cream-300)',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="normal">Normal (400)</option>
                        <option value="semibold">Semi-Tebal (600)</option>
                        <option value="bold">Tebal (700)</option>
                      </select>
                    </div>
                  </div>

                  {/* Color Preset */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                      Warna Teks Judul
                    </label>
                    <select
                      value={content.heroTitleColor || 'var(--text-on-dark)'}
                      onChange={e => setContent({ ...content, heroTitleColor: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--cream-300)',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="var(--text-on-dark)">Putih Krem (Bawaan Header)</option>
                      <option value="var(--gold-500)">Emas Berkilau (Gold #F2C14E)</option>
                      <option value="#FFFDF8">Putih Bersih (Ivory)</option>
                      <option value="#FBEFC7">Krem Lembut (Cream Soft)</option>
                    </select>
                  </div>
                </div>

                {/* Live Font & Italic Preview Box */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brown-700)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    Pratinjau Tampilan Judul di Header:
                  </span>
                  <div
                    style={{
                      backgroundColor: 'var(--brown-900)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      border: '1px solid var(--brown-700)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: content.heroTitleFontFamily === 'script' ? '30px' : '24px',
                        color: content.heroTitleColor || 'var(--text-on-dark)',
                        fontFamily:
                          content.heroTitleFontFamily === 'script'
                            ? "'Dancing Script', 'Brush Script MT', cursive, serif"
                            : content.heroTitleFontFamily === 'cormorant'
                            ? "'Cormorant Garamond', Georgia, serif"
                            : content.heroTitleFontFamily === 'sans'
                            ? "var(--font-sans)"
                            : content.heroTitleFontFamily === 'georgia'
                            ? "Georgia, 'Times New Roman', serif"
                            : "var(--font-serif)",
                        fontStyle: content.heroTitleItalic ? 'italic' : 'normal',
                        fontWeight: content.heroTitleWeight === 'normal' ? 400 : content.heroTitleWeight === 'semibold' ? 600 : 700,
                        lineHeight: 1.25,
                      }}
                    >
                      {content.heroTitle || 'Partner to Enjoy Your Day'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Subjudul / Deskripsi Sambutan Header *
              </label>
              <textarea
                rows={2}
                value={content.heroSubtitle}
                onChange={e => setContent({ ...content, heroSubtitle: e.target.value })}
                placeholder="Deskripsi kelezatan kue..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>

            {/* Badge on Photo Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--cream-100)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Label Kartu di Atas Foto (Kecil)
                </label>
                <input
                  type="text"
                  value={content.heroCardLabel || ''}
                  onChange={e => setContent({ ...content, heroCardLabel: e.target.value })}
                  placeholder="Contoh: RESEP KELUARGA"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Teks Nilai Kartu di Atas Foto (Tebal)
                </label>
                <input
                  type="text"
                  value={content.heroCardText || ''}
                  onChange={e => setContent({ ...content, heroCardText: e.target.value })}
                  placeholder="Contoh: 100% Butter & Bahan Premium"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Special Hampers Promo Banner Settings */}
        <div id="sec-hampers" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px' }}>
            <Gift size={20} color="var(--gold-600)" /> Banner Promo Spesial Hampers & Parcel (Beranda)
          </h2>

          {/* Photo Management Card for Hampers */}
          <div style={{ backgroundColor: 'var(--brown-800)', color: 'var(--cream-100)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', border: '1px solid var(--brown-700)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} /> Foto Kartu Hampers & Parcel (Pita Kado)
              </span>
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--cream-200)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                Tampil di Beranda Toko
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--cream-200)', marginBottom: '16px', lineHeight: 1.5 }}>
              Foto bingkisan kado ini tampil di dalam kartu promo hampers pada halaman Beranda. Anda dapat mengunggah foto hampers asli dari komputer atau memasukkan tautan gambar baru.
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Photo Preview inside brown frame matching homepage */}
              <div style={{ position: 'relative', width: '220px', height: '145px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--gold-500)', boxShadow: 'var(--shadow-md)', flexShrink: 0, backgroundColor: '#000' }}>
                <img
                  src={currentHampersImage}
                  alt="Pratinjau Hampers"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: '6px', left: '6px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                  Pratinjau di Beranda
                </span>
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: 'var(--gold-500)',
                      color: 'var(--brown-900)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Upload size={16} /> Unggah Foto Hampers Baru dari Komputer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHampersImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--cream-300)', display: 'block', marginTop: '6px' }}>
                    Mendukung JPG, PNG, WEBP (Otomatis dikompresi agar ringan)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={content.hampersBannerImageUrl || ''}
                    onChange={e => setContent({ ...content, hampersBannerImageUrl: e.target.value })}
                    placeholder="Atau tautan URL foto hampers (https://...)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: '13px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: 'var(--brown-900)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleResetHampersImage}
                    title="Kembalikan ke foto bawaan"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--cream-100)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Texts for Hampers Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Badge Kecil
                </label>
                <input
                  type="text"
                  value={content.hampersBadge || ''}
                  onChange={e => setContent({ ...content, hampersBadge: e.target.value })}
                  placeholder="Spesial Momen"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Judul Banner Hampers *
                </label>
                <input
                  type="text"
                  value={content.hampersTitle || ''}
                  onChange={e => setContent({ ...content, hampersTitle: e.target.value })}
                  placeholder="Hampers & Parcel Eksklusif"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Deskripsi / Pesan Ajakan Hampers
              </label>
              <textarea
                rows={2}
                value={content.hampersSubtitle || ''}
                onChange={e => setContent({ ...content, hampersSubtitle: e.target.value })}
                placeholder="Sampaikan ungkapan terima kasih, ucapan selamat..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Teks Tombol Aksi
              </label>
              <input
                type="text"
                value={content.hampersButtonText || ''}
                onChange={e => setContent({ ...content, hampersButtonText: e.target.value })}
                placeholder="Pilih Paket Hampers"
                style={{ width: '100%', maxWidth: '300px', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Running Promo Ticker (Spesial Natal, Lebaran, dll) */}
        <div id="sec-ticker" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Megaphone size={20} color="var(--gold-600)" /> Banner Tulisan Berjalan / Promo Momen (Spesial Natal, Lebaran, dll)
            </h2>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={content.tickerActive !== false}
                onChange={e => setContent({ ...content, tickerActive: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--gold-600)' }}
              />
              <span>Aktifkan Tulisan Berjalan</span>
            </label>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '20px', lineHeight: 1.5 }}>
            Teks ini akan berjalan mulus di bagian atas website tepat di bawah navigasi toko. Sangat cocok untuk mengumumkan promo musiman seperti <b>Spesial Hari Raya Idul Fitri, Natal & Tahun Baru, Imlek</b>, atau pengumuman penting lainnya yang dapat Anda ganti kapan pun.
          </p>

          {/* Quick Preset Buttons */}
          <div style={{ backgroundColor: 'var(--cream-100)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brown-800)', display: 'block', marginBottom: '8px' }}>
              ⚡ Tombol Cepat: Muat Template Sesuai Momen Promo
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleApplyTickerTemplate('natal')}
                style={{
                  backgroundColor: '#7F1D1D',
                  color: '#FEF08A',
                  border: '1px solid #B91C1C',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🎄 Template Promo Natal & Tahun Baru
              </button>

              <button
                type="button"
                onClick={() => handleApplyTickerTemplate('lebaran')}
                style={{
                  backgroundColor: '#064E3B',
                  color: '#FDE047',
                  border: '1px solid #047857',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🌙 Template Promo Lebaran / Ramadhan
              </button>

              <button
                type="button"
                onClick={() => handleApplyTickerTemplate('imlek')}
                style={{
                  backgroundColor: '#991B1B',
                  color: '#FEF08A',
                  border: '1px solid #DC2626',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🧧 Template Promo Imlek
              </button>

              <button
                type="button"
                onClick={() => handleApplyTickerTemplate('gold')}
                style={{
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--gold-500)',
                  border: '1px solid var(--gold-600)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✨ Template Promo Reguler (Gold)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Ticker Settings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Tema Warna / Momen
                </label>
                <select
                  value={content.tickerTheme || 'gold'}
                  onChange={e => setContent({ ...content, tickerTheme: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                >
                  <option value="gold">✨ Emas & Cokelat Elegan (Bawaan Toko)</option>
                  <option value="natal">🎄 Spesial Natal (Merah Marun & Emas)</option>
                  <option value="lebaran">🌙 Spesial Lebaran (Hijau Zamrud & Emas)</option>
                  <option value="imlek">🧧 Spesial Imlek (Merah Angpao & Emas)</option>
                  <option value="brown">🍪 Cokelat Hangat</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Label Badge Kiri (Teks Diam di Kiri)
                </label>
                <input
                  type="text"
                  value={content.tickerBadge || ''}
                  onChange={e => setContent({ ...content, tickerBadge: e.target.value })}
                  placeholder="Contoh: 🎄 SPESIAL NATAL & TAHUN BARU"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Ukuran Tulisan Berjalan (Font Size)
                </label>
                <select
                  value={content.tickerFontSize || 'large'}
                  onChange={e => setContent({ ...content, tickerFontSize: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                >
                  <option value="normal">Normal (14px) - Standar Ringkas</option>
                  <option value="large">Besar (16px) - Jelas & Mudah Dibaca ⭐ (Rekomendasi)</option>
                  <option value="xlarge">Ekstra Besar (18px) - Menonjol & Terbaca Jauh</option>
                  <option value="jumbo">Jumbo (20px) - Sangat Besar & Mencolok</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                  Tautan Arah Tombol (Opsional)
                </label>
                <input
                  type="text"
                  value={content.tickerLink || ''}
                  onChange={e => setContent({ ...content, tickerLink: e.target.value })}
                  placeholder="Contoh: /spesial atau /produk"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Pengaturan Kecepatan Berjalan Teks (Slider + Pilihan Cepat) */}
            <div style={{ backgroundColor: 'var(--cream-50)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)' }}>
                  ⏱️ Pengaturan Kecepatan Berjalan Teks
                </label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', backgroundColor: 'var(--gold-100)', padding: '3px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--gold-400)' }}>
                  Durasi: {content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24)} detik
                  {' '}
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--brown-700)' }}>
                    ({(content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24)) >= 45 ? 'Sangat Santai' : (content.tickerSpeedSeconds || (content.tickerSpeed === 'slow' ? 38 : 24)) >= 32 ? 'Lambat & Nyaman' : (content.tickerSpeedSeconds || (content.tickerSpeed === 'fast' ? 15 : 24)) >= 20 ? 'Sedang / Normal' : (content.tickerSpeedSeconds || 24) >= 12 ? 'Cepat' : 'Sangat Cepat'})
                  </span>
                </span>
              </div>

              {/* Range Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-600)', minWidth: '70px' }}>
                  🐇 Cepat (8s)
                </span>
                <input
                  type="range"
                  min={8}
                  max={60}
                  step={1}
                  value={content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24)}
                  onChange={e => {
                    const sec = Number(e.target.value);
                    const speedTag = sec >= 45 ? 'very_slow' : sec >= 32 ? 'slow' : sec >= 20 ? 'medium' : sec >= 12 ? 'fast' : 'very_fast';
                    setContent({ ...content, tickerSpeedSeconds: sec, tickerSpeed: speedTag });
                  }}
                  style={{
                    flex: 1,
                    accentColor: 'var(--gold-600)',
                    cursor: 'pointer',
                    height: '6px',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-600)', minWidth: '70px', textAlign: 'right' }}>
                  🐢 Lambat (60s)
                </span>
              </div>

              {/* Quick Preset Buttons for Speed */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--brown-600)', fontWeight: 600 }}>
                  Pilihan Cepat:
                </span>
                {[
                  { label: 'Sangat Lambat (50s)', sec: 50, tag: 'very_slow' },
                  { label: 'Lambat (38s)', sec: 38, tag: 'slow' },
                  { label: 'Sedang / Normal (24s)', sec: 24, tag: 'medium' },
                  { label: 'Cepat (15s)', sec: 15, tag: 'fast' },
                  { label: 'Sangat Cepat (9s)', sec: 9, tag: 'very_fast' },
                ].map(p => {
                  const currentSec = content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24);
                  const isSelected = currentSec === p.sec;

                  return (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => setContent({ ...content, tickerSpeedSeconds: p.sec, tickerSpeed: p.tag })}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? 'var(--brown-900)' : '#FFFFFF',
                        color: isSelected ? 'var(--gold-500)' : 'var(--brown-800)',
                        border: isSelected ? '1px solid var(--brown-900)' : '1px solid var(--cream-300)',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Ticker Textarea */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Kalimat Teks Berjalan Promo *
              </label>
              <textarea
                rows={3}
                value={content.tickerText || ''}
                onChange={e => setContent({ ...content, tickerText: e.target.value })}
                placeholder="Tulis kalimat promo atau pengumuman Anda di sini..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', lineHeight: '1.5' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--brown-500)', display: 'block', marginTop: '4px' }}>
                💡 Tips: Anda dapat memisahkan beberapa kalimat pengumuman dengan tanda titik tengah (•) agar tampak menarik dan rapi saat berjalan.
              </span>
            </div>

            {/* Live Animation Preview Box */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brown-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pratinjau Animasi Tulisan Berjalan (Live):
                </span>
                <span style={{ fontSize: '11px', color: 'var(--brown-700)', backgroundColor: 'var(--cream-100)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  Ukuran Teks: <b>{content.tickerFontSize === 'jumbo' ? '20px (Jumbo)' : content.tickerFontSize === 'xlarge' ? '18px (Ekstra Besar)' : content.tickerFontSize === 'normal' ? '14px (Normal)' : '16px (Besar)'}</b> • Kecepatan: <b>{content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24)}s</b>
                </span>
              </div>
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--cream-300)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    background:
                      content.tickerTheme === 'natal'
                        ? 'linear-gradient(90deg, #7F1D1D, #991B1B)'
                        : content.tickerTheme === 'lebaran'
                        ? 'linear-gradient(90deg, #064E3B, #065F46)'
                        : content.tickerTheme === 'imlek'
                        ? 'linear-gradient(90deg, #991B1B, #B91C1C)'
                        : content.tickerTheme === 'brown'
                        ? 'linear-gradient(90deg, #4A2E1C, #5E3B25)'
                        : 'linear-gradient(90deg, #2A170C, #3B2416)',
                    color: content.tickerTheme === 'gold' ? 'var(--gold-100)' : '#FFFDF8',
                    height: content.tickerFontSize === 'jumbo' ? '62px' : content.tickerFontSize === 'xlarge' ? '56px' : content.tickerFontSize === 'normal' ? '46px' : '50px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: content.tickerFontSize === 'jumbo' ? '20px' : content.tickerFontSize === 'xlarge' ? '18px' : content.tickerFontSize === 'normal' ? '14px' : '16px',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      padding: content.tickerFontSize === 'jumbo' ? '0 20px' : content.tickerFontSize === 'xlarge' ? '0 18px' : content.tickerFontSize === 'normal' ? '0 14px' : '0 16px',
                      height: '100%',
                      backgroundColor:
                        content.tickerTheme === 'natal' || content.tickerTheme === 'imlek'
                          ? '#FEF08A'
                          : content.tickerTheme === 'lebaran'
                          ? '#FDE047'
                          : content.tickerTheme === 'brown'
                          ? '#FBEFC7'
                          : 'var(--gold-500)',
                      color:
                        content.tickerTheme === 'natal' || content.tickerTheme === 'imlek'
                          ? '#7F1D1D'
                          : content.tickerTheme === 'lebaran'
                          ? '#064E3B'
                          : 'var(--brown-900)',
                      fontWeight: 800,
                      fontSize: content.tickerFontSize === 'jumbo' ? '14px' : content.tickerFontSize === 'xlarge' ? '13px' : content.tickerFontSize === 'normal' ? '11px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {content.tickerBadge ||
                      (content.tickerTheme === 'natal'
                        ? '🎄 SPESIAL NATAL & TAHUN BARU'
                        : content.tickerTheme === 'lebaran'
                        ? '🌙 SPESIAL LEBARAN & IDUL FITRI'
                        : content.tickerTheme === 'imlek'
                        ? '🧧 SPESIAL IMLEK & HARI RAYA'
                        : '✨ PROMO SPESIAL')}
                  </div>
                  <div className="bcc-ticker-wrapper" style={{ paddingLeft: '14px' }}>
                    <div
                      className="bcc-ticker-track"
                      style={{
                        animationDuration: `${content.tickerSpeedSeconds || (content.tickerSpeed === 'very_slow' ? 50 : content.tickerSpeed === 'slow' ? 38 : content.tickerSpeed === 'fast' ? 15 : content.tickerSpeed === 'very_fast' ? 9 : 24)}s`,
                      }}
                    >
                      {[1, 2].map(i => (
                        <span key={i} style={{ paddingRight: '40px' }}>
                          {content.tickerText ||
                            (content.tickerTheme === 'natal'
                              ? '🎄 Promo Spesial Natal & Tahun Baru: Buka Pre-Order Paket Hampers Eksklusif & Cake Hantaran Mewah! Hubungi WhatsApp untuk amankan slot Anda • Dipanggang segar setiap hari'
                              : content.tickerTheme === 'lebaran'
                              ? '🌙 Spesial Hari Raya Idul Fitri: Paket Hampers Nastar Keju Wijsman, Kastengel & Lapis Legit Spekkoek siap diantar! Pesan lebih awal sebelum kuota penuh'
                              : '✨ Buka Setiap Hari: 08.00 - 20.00 WITA • Nikmati Kelezatan Cake, Cookies, dan Hampers Eksklusif Bintang Cake & Cookies • Pengiriman Wilayah Samarinda & Balikpapan')}
                          <span style={{ marginLeft: '16px', opacity: 0.6 }}>✦</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Kelola Foto Kategori Pilihan (Beranda) */}
        <div id="sec-categories" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Folder size={20} color="var(--gold-600)" /> Kelola Foto Kategori Pilihan (Beranda)
            </h2>
            <span style={{ fontSize: '12px', backgroundColor: 'var(--gold-100)', color: 'var(--brown-900)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              {categories.length} Kategori Aktif
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '20px', lineHeight: 1.5 }}>
            Ganti semua gambar yang tampil pada 6 kartu <b>"Kategori Pilihan"</b> di halaman depan toko. Klik tombol <b>"Unggah Foto Baru"</b> untuk memilih foto kue dari komputer/HP Anda (otomatis dikompresi agar jernih dan hemat penyimpanan).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                style={{
                  border: '1px solid var(--cream-300)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--cream-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {/* Category Preview Image */}
                <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: 'var(--cream-200)', overflow: 'hidden' }}>
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      color: 'var(--brown-900)',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    /kategori/{cat.slug}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)', margin: 0 }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Urutan ke-{cat.sortOrder}
                    </span>
                  </div>

                  {/* Upload Button */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--brown-900)',
                      color: 'var(--gold-500)',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    <Upload size={14} />
                    <span>Unggah Foto {cat.name} Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleUploadCategoryImage(cat.id, e)}
                    />
                  </label>

                  {/* URL Input */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar..."
                      value={catUrlInputs[cat.id] ?? ''}
                      onChange={e => setCatUrlInputs({ ...catUrlInputs, [cat.id]: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        fontSize: '11px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--cream-300)',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryUrl(cat.id)}
                      disabled={!catUrlInputs[cat.id]?.trim()}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'var(--gold-500)',
                        color: 'var(--brown-900)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: catUrlInputs[cat.id]?.trim() ? 'pointer' : 'not-allowed',
                        opacity: catUrlInputs[cat.id]?.trim() ? 1 : 0.6,
                      }}
                    >
                      Pasang
                    </button>
                  </div>

                  {/* Reset to Default */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--cream-300)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleResetCategoryImage(cat.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brown-600)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 6px',
                      }}
                    >
                      <RotateCcw size={12} /> Reset Foto Awal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Kelola Foto Produk Istimewa Hari Ini (Beranda) */}
        <div id="sec-featured" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Cookie size={20} color="var(--gold-600)" /> Kelola Foto Produk "Istimewa Hari Ini" (Beranda)
            </h2>
            <span style={{ fontSize: '12px', backgroundColor: 'var(--gold-100)', color: 'var(--brown-900)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              {products.filter(p => p.featured).length} Produk Tampil
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--brown-600)', marginBottom: '20px', lineHeight: 1.5 }}>
            Bagian <b>"Istimewa Hari Ini"</b> menampilkan produk-produk favorit yang direkomendasikan kepada pembeli di halaman depan toko. Anda dapat mengunggah foto baru untuk masing-masing produk atau memilih produk lain yang ingin ditampilkan di beranda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {products.filter(p => p.featured).map((prod) => {
              const cat = categories.find(c => c.id === prod.categoryId);
              const primaryImg = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80';
              const minPrice = prod.variants && prod.variants.length > 0 ? Math.min(...prod.variants.map(v => v.price)) : 0;
              const maxPrice = prod.variants && prod.variants.length > 0 ? Math.max(...prod.variants.map(v => v.price)) : 0;

              return (
                <div
                  key={prod.id}
                  style={{
                    border: '1px solid var(--cream-300)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--cream-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {/* Product Preview Image */}
                  <div style={{ position: 'relative', width: '100%', height: '150px', backgroundColor: 'var(--cream-200)', overflow: 'hidden' }}>
                    <img
                      src={primaryImg}
                      alt={prod.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    {cat && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: 'var(--brown-900)',
                          color: 'var(--gold-500)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {cat.name}
                      </span>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(242, 193, 78, 0.95)',
                        color: 'var(--brown-900)',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      ★ Istimewa
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brown-900)', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {prod.name}
                      </h3>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-700)' }}>
                        {minPrice === maxPrice ? formatRupiah(minPrice) : `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`}
                      </div>
                    </div>

                    {/* Upload Button */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--brown-900)',
                        color: 'var(--gold-500)',
                        padding: '9px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <Upload size={14} />
                      <span>Unggah Foto Produk Ini</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleUploadProductImage(prod.id, e)}
                      />
                    </label>

                    {/* URL Input */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Atau tempel URL gambar..."
                        value={prodUrlInputs[prod.id] ?? ''}
                        onChange={e => setProdUrlInputs({ ...prodUrlInputs, [prod.id]: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '11px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--cream-300)',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyProductUrl(prod.id)}
                        disabled={!prodUrlInputs[prod.id]?.trim()}
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: 'var(--gold-500)',
                          color: 'var(--brown-900)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: prodUrlInputs[prod.id]?.trim() ? 'pointer' : 'not-allowed',
                          opacity: prodUrlInputs[prod.id]?.trim() ? 1 : 0.6,
                        }}
                      >
                        Pasang
                      </button>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--cream-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--brown-800)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={prod.featured}
                          onChange={e => handleToggleFeatured(prod.id, e.target.checked)}
                          style={{ accentColor: 'var(--gold-600)' }}
                        />
                        <span>Tampil di Beranda</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleResetProductImage(prod.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brown-600)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add another product to Featured section */}
          {products.filter(p => !p.featured).length > 0 && (
            <div style={{ backgroundColor: 'var(--cream-100)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--cream-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={18} color="var(--gold-600)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-900)' }}>
                  Ingin menampilkan produk lain di "Istimewa Hari Ini"?
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  id="select-add-featured"
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#FFFFFF', color: 'var(--brown-900)' }}
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) {
                      handleToggleFeatured(e.target.value, true);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="" disabled>-- Pilih Produk untuk Ditampilkan --</option>
                  {products.filter(p => !p.featured).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Link
                  to="/admin/produk"
                  style={{
                    fontSize: '12px',
                    color: 'var(--brown-800)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--cream-300)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                  }}
                >
                  <span>Kelola Semua Produk</span> &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: About Us & How to Order */}
        <div id="sec-about" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px' }}>
            <FileText size={20} color="var(--gold-600)" /> Halaman Tentang Kami & Cara Memesan
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Cerita Toko (Tentang Kami)
              </label>
              <textarea
                rows={4}
                value={content.aboutUs || content.aboutUsText || ''}
                onChange={e => setContent({ ...content, aboutUs: e.target.value, aboutUsText: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '6px' }}>
                Panduan Cara Memesan
              </label>
              <textarea
                rows={4}
                value={content.howToOrder || content.howToOrderText || ''}
                onChange={e => setContent({ ...content, howToOrder: e.target.value, howToOrderText: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              type="submit"
              style={{
                padding: '12px 28px',
                backgroundColor: 'var(--brown-900)',
                color: 'var(--gold-500)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Save size={18} /> Simpan Seluruh Perubahan Konten & Header
            </button>
          </div>
        </div>
      </form>

      {/* Section 7: Gallery Section */}
      <div id="sec-gallery" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ImageIcon size={20} color="var(--gold-600)" /> Kelola Foto Galeri ({gallery.length})
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--brown-600)', marginTop: '2px', display: 'block' }}>
              Foto kue pesanan, edisi spesial hari raya, dan inspirasi momen manis pelanggan
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleOptimizeStorage}
              disabled={optimizing}
              title="Kompres foto-foto lama agar memori browser kembali lega"
              style={{
                padding: '8px 14px',
                backgroundColor: 'var(--cream-100)',
                color: 'var(--brown-800)',
                border: '1px solid var(--cream-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: optimizing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Zap size={14} color="var(--gold-600)" />
              <span>{optimizing ? 'Mengoptimalkan...' : 'Optimalkan Memori'}</span>
            </button>

            <button
              onClick={() => setNewGalleryOpen(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--brown-900)',
                color: 'var(--gold-500)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={14} /> Tambah Foto Galeri
            </button>
          </div>
        </div>

        {/* Storage Capacity Status Banner */}
        <div
          style={{
            backgroundColor: 'var(--cream-50)',
            border: '1px solid var(--cream-300)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HardDrive size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Kapasitas Ruang Galeri: Sangat Luas (Didukung IndexedDB)</span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#15803D', padding: '1px 8px', borderRadius: 'var(--radius-full)' }}>
                  ✓ Kompresi Otomatis Aktif
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brown-600)', marginTop: '2px' }}>
                Setiap foto yang Anda unggah kini otomatis dioptimalkan ke ukuran ringan (~35 KB) tanpa mengurangi kejernihan gambar. Galeri Anda kini siap menampung puluhan hingga ratusan foto kue!
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {gallery.map(item => (
            <div
              key={item.id}
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              />
              <div style={{ padding: '8px 10px', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--brown-900)' }}>{item.title}</div>
                <div style={{ color: 'var(--brown-500)', fontSize: '11px' }}>{item.category}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteGallery(item.id);
                }}
                title="Hapus foto"
                aria-label={`Hapus foto ${item.title}`}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--danger-600, #DC2626)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  transition: 'background-color 0.2s, transform 0.15s',
                  zIndex: 10,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Gallery Modal */}
      {newGalleryOpen && (
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
          <form
            onSubmit={handleAddGalleryItem}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
            }}
          >
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', marginBottom: '16px' }}>
              Tambah Foto ke Galeri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Judul Foto / Kue *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kue Ulang Tahun Floral Elegant"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kue Ulang Tahun, Cookies, Bolu Gulung"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Pilih Foto Gambar *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageFile}
                  style={{ width: '100%', fontSize: '12px', padding: '6px', border: '1px solid var(--cream-300)', borderRadius: 'var(--radius-md)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--brown-500)', display: 'block', marginTop: '4px' }}>
                  💡 Foto otomatis dikompresi ke resolusi optimal (~35 KB) sehingga galeri bisa memuat banyak foto.
                </span>
                {newImage && (
                  <div style={{ marginTop: '10px', position: 'relative' }}>
                    <img src={newImage} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--gold-500)' }} />
                    <span style={{ position: 'absolute', bottom: '6px', left: '6px', backgroundColor: 'rgba(21, 128, 61, 0.9)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      ✓ Foto Terkompresi & Hemat Ruang
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setNewGalleryOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--cream-200)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{ padding: '8px 18px', backgroundColor: 'var(--brown-900)', color: 'var(--text-on-dark)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Tambahkan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Banner Slide Modal */}
      {bannerModalOpen && (
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
            overflowY: 'auto',
          }}
        >
          <form
            onSubmit={handleSaveBannerModal}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cream-300)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', margin: 0, fontWeight: 700 }}>
                {editingBannerId ? 'Edit Slide Banner' : 'Tambah Slide Banner Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {/* Photo Upload Area */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
                  Foto Banner *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: 'var(--brown-900)',
                      color: 'var(--gold-500)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: 'fit-content',
                    }}
                  >
                    <Upload size={14} /> Pilih Foto dari HP / Komputer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerModalImageFile}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar (https://...)"
                    value={bannerImage}
                    onChange={e => setBannerImage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-300)',
                      fontSize: '12px',
                    }}
                  />
                  {bannerImage && (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--gold-500)', marginTop: '4px' }}>
                      <img src={bannerImage} alt="Pratinjau Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: '6px', left: '6px', backgroundColor: 'rgba(21, 128, 61, 0.9)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        ✓ Foto Banner Siap
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Judul Banner / Headline *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Paket Hampers Spesial Hari Raya"
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Subtitle / Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Aneka sajian cookies dan cake lezat dipanggang segar dengan bahan pilihan terbaik."
                  value={bannerSubtitle}
                  onChange={e => setBannerSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Badge Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                  Lencana Kecil di Atas Judul (Badge)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Panggangan Segar Samarinda, Edisi Terbatas, dll."
                  value={bannerBadge}
                  onChange={e => setBannerBadge(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                />
              </div>

              {/* Button Text & Target Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                    Teks Tombol Aksi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lihat Seluruh Produk"
                    value={bannerButtonText}
                    onChange={e => setBannerButtonText(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-800)', display: 'block', marginBottom: '4px' }}>
                    Tautan Tujuan (Link)
                  </label>
                  <select
                    value={bannerLinkUrl}
                    onChange={e => setBannerLinkUrl(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="/produk">Katalog Produk (/produk)</option>
                    <option value="/spesial">Paket Spesial & Hampers (/spesial)</option>
                    <option value="/galeri">Galeri Toko (/galeri)</option>
                    <option value="/kategori/cat-cake">Kategori Cake (/kategori/cat-cake)</option>
                    <option value="/kategori/cat-cookies">Kategori Cookies (/kategori/cat-cookies)</option>
                    <option value="/kategori/cat-lapis">Kategori Lapis Legit (/kategori/cat-lapis)</option>
                    <option value="/kategori/cat-custom">Paket Custom (/kategori/cat-custom)</option>
                    <option value="/cara-memesan">Panduan Cara Pesan (/cara-memesan)</option>
                    <option value="/tentang-kami">Tentang Kami (/tentang-kami)</option>
                  </select>
                </div>
              </div>

              {/* Active Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--brown-900)', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={bannerActive}
                  onChange={e => setBannerActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-600)' }}
                />
                <span>Aktifkan dan tampilkan slide ini di beranda toko</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--cream-200)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{ padding: '8px 20px', backgroundColor: 'var(--brown-900)', color: 'var(--gold-500)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {editingBannerId ? 'Simpan Perubahan' : 'Tambahkan Slide Banner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
