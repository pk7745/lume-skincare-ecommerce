import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

type RecentlyViewedState = {
  products: Product[];
  addProduct: (product: Product) => void;
  clear: () => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const current = get().products;
        const filtered = current.filter((p) => p.id !== product.id && p.slug !== product.slug);
        const updated = [product, ...filtered].slice(0, 8);
        set({ products: updated });
      },
      clear: () => set({ products: [] }),
    }),
    { name: 'lume-recently-viewed' }
  )
);
