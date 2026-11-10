import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalStorageCategoryRepository,
  LocalStorageProductRepository,
  LocalStorageOrderRepository,
  LocalStorageSettingsRepository,
  initializeSeedData,
} from './localStorageRepositories';
import { Order } from '@/types';

describe('LocalStorage Repositories & Business Logic', () => {
  let catRepo: LocalStorageCategoryRepository;
  let prodRepo: LocalStorageProductRepository;
  let orderRepo: LocalStorageOrderRepository;

  beforeEach(() => {
    localStorage.clear();
    initializeSeedData(true);
    catRepo = new LocalStorageCategoryRepository();
    prodRepo = new LocalStorageProductRepository();
    orderRepo = new LocalStorageOrderRepository();
  });

  it('initializes seed data with 6 categories and demo products', () => {
    const categories = catRepo.getAll();
    expect(categories.length).toBe(6);
    expect(categories.map(c => c.slug)).toEqual([
      'cake',
      'cookies',
      'lidah-kucing',
      'lapis-legit',
      'hampers-parcel',
      'paket-custom',
    ]);

    const products = prodRepo.getAll();
    expect(products.length).toBeGreaterThanOrEqual(7);
  });

  it('performs idempotent stock deduction upon order confirmation (PRD §29.2)', () => {
    // Pick Nastar Wisman
    const nastar = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    const variant500g = nastar.variants.find(v => v.id === 'var-nastar-500g')!;
    const initialStock = variant500g.stockQuantity; // e.g. 15

    const orderNumber = orderRepo.getNextOrderNumber();
    const testOrder: Order = {
      id: 'ord-test-1',
      orderNumber,
      customerName: 'Budi Test',
      customerWhatsapp: '6281234567890',
      items: [
        {
          id: 'item-1',
          productId: nastar.id,
          productName: nastar.name,
          variantId: variant500g.id,
          variantName: variant500g.name,
          packagingType: variant500g.packagingType,
          unitPrice: variant500g.price,
          quantity: 3,
          subtotal: variant500g.price * 3,
          itemStatus: 'menunggu_konfirmasi_admin',
          stockDeducted: false,
        },
      ],
      subtotal: variant500g.price * 3,
      shippingFee: 0,
      shippingFeeConfirmed: true,
      totalAmount: variant500g.price * 3,
      deliveryMethod: 'pickup',
      requestedDate: '2026-11-10',
      orderStatus: 'menunggu_konfirmasi_admin',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      statusHistory: [],
      changeHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orderRepo.create(testOrder);

    // Initial check: creating order does NOT deduct stock (PRD §29.1)
    const freshNastar1 = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(freshNastar1.variants.find(v => v.id === variant500g.id)!.stockQuantity).toBe(initialStock);

    // Confirm order (Admin action)
    const result1 = orderRepo.confirmOrderAndDeductStock('ord-test-1', 'Admin Test', prodRepo);
    expect(result1.success).toBe(true);

    // Stock should be deducted exactly once (-3)
    const freshNastar2 = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(freshNastar2.variants.find(v => v.id === variant500g.id)!.stockQuantity).toBe(initialStock - 3);

    // Double confirmation must NOT deduct stock again (Idempotency check)
    const result2 = orderRepo.confirmOrderAndDeductStock('ord-test-1', 'Admin Test', prodRepo);
    expect(result2.success).toBe(false);

    const freshNastar3 = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(freshNastar3.variants.find(v => v.id === variant500g.id)!.stockQuantity).toBe(initialStock - 3);
  });

  it('rejects confirmation and deducts 0 stock if any item has insufficient stock (PRD §29.3)', () => {
    const nastar = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    const variant500g = nastar.variants.find(v => v.id === 'var-nastar-500g')!;
    const initialNastarStock = variant500g.stockQuantity;

    const bolu = prodRepo.getBySlug('bolu-gulung-keju-lembut')!;
    const variantBolu = bolu.variants[0];
    const initialBoluStock = variantBolu.stockQuantity;

    const orderNumber = orderRepo.getNextOrderNumber();
    const testOrder: Order = {
      id: 'ord-test-insufficient',
      orderNumber,
      customerName: 'Budi Test',
      customerWhatsapp: '6281234567890',
      items: [
        {
          id: 'item-1',
          productId: nastar.id,
          productName: nastar.name,
          variantId: variant500g.id,
          variantName: variant500g.name,
          packagingType: variant500g.packagingType,
          unitPrice: variant500g.price,
          quantity: 2, // Valid amount
          subtotal: variant500g.price * 2,
          itemStatus: 'menunggu_konfirmasi_admin',
          stockDeducted: false,
        },
        {
          id: 'item-2',
          productId: bolu.id,
          productName: bolu.name,
          variantId: variantBolu.id,
          variantName: variantBolu.name,
          packagingType: variantBolu.packagingType,
          unitPrice: variantBolu.price,
          quantity: 9999, // Insufficient stock!
          subtotal: variantBolu.price * 9999,
          itemStatus: 'menunggu_konfirmasi_admin',
          stockDeducted: false,
        },
      ],
      subtotal: 100000,
      shippingFee: 0,
      shippingFeeConfirmed: true,
      totalAmount: 100000,
      deliveryMethod: 'pickup',
      requestedDate: '2026-11-10',
      orderStatus: 'menunggu_konfirmasi_admin',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      statusHistory: [],
      changeHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orderRepo.create(testOrder);

    const result = orderRepo.confirmOrderAndDeductStock('ord-test-insufficient', 'Admin', prodRepo);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Stok tidak mencukupi');

    // Neither nastar nor bolu stock was deducted!
    const freshNastar = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(freshNastar.variants.find(v => v.id === variant500g.id)!.stockQuantity).toBe(initialNastarStock);

    const freshBolu = prodRepo.getBySlug('bolu-gulung-keju-lembut')!;
    expect(freshBolu.variants[0].stockQuantity).toBe(initialBoluStock);
  });

  it('handles cancellation and explicit restock by admin (PRD §29.4)', () => {
    const nastar = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    const variant500g = nastar.variants[0];
    const initialStock = variant500g.stockQuantity;

    const orderNumber = orderRepo.getNextOrderNumber();
    const testOrder: Order = {
      id: 'ord-test-cancel',
      orderNumber,
      customerName: 'Budi Test',
      customerWhatsapp: '6281234567890',
      items: [
        {
          id: 'item-1',
          productId: nastar.id,
          productName: nastar.name,
          variantId: variant500g.id,
          variantName: variant500g.name,
          packagingType: variant500g.packagingType,
          unitPrice: variant500g.price,
          quantity: 2,
          subtotal: variant500g.price * 2,
          itemStatus: 'menunggu_konfirmasi_admin',
          stockDeducted: false,
        },
      ],
      subtotal: variant500g.price * 2,
      shippingFee: 0,
      shippingFeeConfirmed: true,
      totalAmount: variant500g.price * 2,
      deliveryMethod: 'pickup',
      requestedDate: '2026-11-10',
      orderStatus: 'menunggu_konfirmasi_admin',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      statusHistory: [],
      changeHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orderRepo.create(testOrder);
    orderRepo.confirmOrderAndDeductStock('ord-test-cancel', 'Admin', prodRepo);

    // Cancel order
    const cancelOk = orderRepo.cancelOrder('ord-test-cancel', 'Admin', 'Pelanggan minta batal');
    expect(cancelOk).toBe(true);

    // Stock should NOT auto-restock upon cancellation
    const nastarAfterCancel = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(nastarAfterCancel.variants[0].stockQuantity).toBe(initialStock - 2);

    // Explicit restock action by admin
    const restockOk = orderRepo.restockOrder('ord-test-cancel', 'Admin', prodRepo);
    expect(restockOk).toBe(true);

    const nastarAfterRestock = prodRepo.getBySlug('nastar-wisman-super-butter')!;
    expect(nastarAfterRestock.variants[0].stockQuantity).toBe(initialStock);
  });

  it('manages gallery items: adding and deleting successfully removes from storage', () => {
    const settingsRepo = new LocalStorageSettingsRepository();
    const initialItems = settingsRepo.getGallery();
    const initialCount = initialItems.length;

    const testItem = {
      id: 'gal-test-1',
      title: 'Test Cake Photo',
      category: 'Cake',
      imageUrl: 'https://example.com/test.jpg',
      active: true,
      sortOrder: initialCount + 1,
      createdAt: new Date().toISOString(),
    };

    // Add item
    settingsRepo.saveGalleryItem(testItem);
    const afterAdd = settingsRepo.getGallery();
    expect(afterAdd.length).toBe(initialCount + 1);
    expect(afterAdd.some(g => g.id === 'gal-test-1')).toBe(true);

    // Delete item
    settingsRepo.deleteGalleryItem('gal-test-1');
    const afterDelete = settingsRepo.getGallery();
    expect(afterDelete.length).toBe(initialCount);
    expect(afterDelete.some(g => g.id === 'gal-test-1')).toBe(false);
  });
});
