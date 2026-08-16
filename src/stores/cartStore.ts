import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { cartApi } from '@/lib/api/cartApi';
import { orderApi } from '@/lib/api/orderApi';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string | null;
  promoDiscount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, size: string, qty?: number) => Promise<void>;
  removeItem: (productId: string, size: string) => Promise<void>;
  updateQty: (productId: string, size: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  syncServerCart: () => Promise<void>;
  applyPromo: (code: string) => Promise<boolean>;
  removePromo: () => void;
}

const DEFAULT_PROMOS: Record<string, number> = {
  WELCOME10: 0.1,
  LUME15: 0.15,
  GLOW20: 0.2,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      promoDiscount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: async (product, size, qty = 1) => {
        const { user } = useAuthStore.getState();
        const current = get().items;
        const idx = current.findIndex((i) => i.product_id === product.id && i.size === size);

        let next: CartItem[];
        if (idx > -1) {
          next = current.map((item, i) =>
            i === idx ? { ...item, qty: Math.min(product.stock, item.qty + qty) } : item
          );
        } else {
          next = [
            ...current,
            {
              product_id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              image: product.images[0],
              size,
              qty: Math.min(product.stock, qty),
              stock: product.stock,
            },
          ];
        }
        set({ items: next, isOpen: true });

        if (user) {
          try {
            await cartApi.addItem(product.id, size, qty);
          } catch (err) {
            console.error('[CartStore addItem Server Error]:', err);
          }
        }
      },

      removeItem: async (productId, size) => {
        const { user } = useAuthStore.getState();
        set((s) => ({
          items: s.items.filter((i) => !(i.product_id === productId && i.size === size)),
        }));

        if (user) {
          try {
            await cartApi.removeItem(productId, size);
          } catch (err) {
            console.error('[CartStore removeItem Server Error]:', err);
          }
        }
      },

      updateQty: async (productId, size, qty) => {
        const { user } = useAuthStore.getState();
        if (qty <= 0) {
          return get().removeItem(productId, size);
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product_id === productId && i.size === size ? { ...i, qty: Math.min(i.stock, qty) } : i
          ),
        }));

        if (user) {
          try {
            await cartApi.updateQty(productId, qty, size);
          } catch (err) {
            console.error('[CartStore updateQty Server Error]:', err);
          }
        }
      },

      clearCart: async () => {
        const { user } = useAuthStore.getState();
        set({ items: [], promoCode: null, promoDiscount: 0 });
        if (user) {
          try {
            await cartApi.clearCart();
          } catch (err) {
            console.error('[CartStore clearCart Server Error]:', err);
          }
        }
      },

      syncWithServer: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        try {
          const serverCart = await cartApi.getCart();
          if (serverCart && Array.isArray(serverCart.items)) {
            set({ items: serverCart.items });
          }
        } catch (err) {
          console.error('[CartStore Sync Error]:', err);
        }
      },

      syncServerCart: async () => {
        return get().syncWithServer();
      },

      applyPromo: async (code) => {
        const upper = code.toUpperCase().trim();
        try {
          const promo = await orderApi.validatePromo(upper);
          if (promo) {
            const discount = promo.discountType === 'percentage' ? promo.discountValue / 100 : promo.discountValue;
            set({ promoCode: upper, promoDiscount: discount });
            return true;
          }
        } catch {
          if (DEFAULT_PROMOS[upper] !== undefined) {
            set({ promoCode: upper, promoDiscount: DEFAULT_PROMOS[upper] });
            return true;
          }
        }
        return false;
      },

      removePromo: () => set({ promoCode: null, promoDiscount: 0 }),
    }),
    { name: 'lume-cart' }
  )
);

export function selectCartCount(s: CartState) {
  return s.items.reduce((sum, i) => sum + i.qty, 0);
}

export function selectCartSubtotal(s: CartState) {
  return s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCartTotals(items: CartItem[], promoDiscount: number) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = subtotal * promoDiscount;
  const shipping = subtotal > 75 ? 0 : subtotal > 0 ? 6.95 : 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;
  return { subtotal, discount, shipping, tax, total };
}
