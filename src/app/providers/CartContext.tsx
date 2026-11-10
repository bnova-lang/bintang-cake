import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';
import { repos } from '@/services/repositories';

export interface DetailedCartItem extends CartItem {
  product: Product;
  variant: ProductVariant;
  unitPrice: number;
  itemSubtotal: number;
}

interface CartContextType {
  items: CartItem[];
  detailedItems: DetailedCartItem[];
  totalItems: number;
  subtotal: number;
  maxLeadTime: number; // For pre-order validation
  addItem: (productId: string, variantId: string, quantity: number, notes?: string) => boolean;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    return repos.cartRepo.getCart().items || [];
  });

  const saveItems = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    repos.cartRepo.saveCart({ items: newItems, updatedAt: new Date().toISOString() });
  }, []);

  const addItem = (productId: string, variantId: string, quantity: number, notes?: string): boolean => {
    const product = repos.productRepo.getById(productId);
    if (!product || !product.active) return false;

    const variant = product.variants.find(v => v.id === variantId && v.active);
    if (!variant) return false;

    // Check stock if ready_stock
    const availableStock = product.stockMode === 'per_product' ? product.stockQuantity : variant.stockQuantity;
    if (product.fulfillmentType === 'ready_stock' && availableStock <= 0) {
      return false;
    }

    const currentItems = [...items];
    const existingIndex = currentItems.findIndex(i => i.productId === productId && i.variantId === variantId);

    if (existingIndex >= 0) {
      const newQty = currentItems[existingIndex].quantity + quantity;
      if (product.fulfillmentType === 'ready_stock' && newQty > availableStock) {
        return false;
      }
      currentItems[existingIndex].quantity = newQty;
      if (notes) {
        currentItems[existingIndex].notes = notes;
      }
    } else {
      currentItems.push({
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId,
        variantId,
        quantity,
        notes,
      });
    }

    saveItems(currentItems);
    return true;
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const current = [...items];
    const index = current.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const item = current[index];
    const product = repos.productRepo.getById(item.productId);
    if (!product) return;

    const variant = product.variants.find(v => v.id === item.variantId);
    if (!variant) return;

    const availableStock = product.stockMode === 'per_product' ? product.stockQuantity : variant.stockQuantity;
    const nextQty = item.quantity + delta;

    if (nextQty <= 0) {
      current.splice(index, 1);
    } else {
      if (product.fulfillmentType === 'ready_stock' && nextQty > availableStock) {
        return; // Exceeds available stock
      }
      item.quantity = nextQty;
    }

    saveItems(current);
  };

  const removeItem = (itemId: string) => {
    const filtered = items.filter(i => i.id !== itemId);
    saveItems(filtered);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const detailedItems = useMemo((): DetailedCartItem[] => {
    const result: DetailedCartItem[] = [];
    for (const item of items) {
      const product = repos.productRepo.getById(item.productId);
      if (!product) continue;
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) continue;

      const unitPrice = variant.price;
      result.push({
        ...item,
        product,
        variant,
        unitPrice,
        itemSubtotal: unitPrice * item.quantity,
      });
    }
    return result;
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return detailedItems.reduce((acc, curr) => acc + curr.itemSubtotal, 0);
  }, [detailedItems]);

  const maxLeadTime = useMemo(() => {
    let max = 0;
    for (const item of detailedItems) {
      if (item.product.fulfillmentType === 'pre_order') {
        max = Math.max(max, item.product.preOrderLeadTime || 1);
      }
    }
    return max;
  }, [detailedItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        detailedItems,
        totalItems,
        subtotal,
        maxLeadTime,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
