import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '@/lib/api/wishlistApi';
import { useAuthStore } from './authStore';

type WishlistState = {
  productIds: string[];
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  remove: (productId: string) => Promise<void>;
  syncFromServer: () => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      loading: false,

      syncFromServer: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        try {
          set({ loading: true });
          const res = await wishlistApi.getWishlist();
          if (res && Array.isArray(res.productIds)) {
            set({ productIds: res.productIds });
          }
        } catch {
          // Keep local wishlist if server fails
        } finally {
          set({ loading: false });
        }
      },

      toggle: async (productId) => {
        const user = useAuthStore.getState().user;
        const exists = get().productIds.includes(productId);

        if (user) {
          try {
            if (exists) {
              const res = await wishlistApi.removeFromWishlist(productId);
              set({ productIds: res.productIds });
            } else {
              const res = await wishlistApi.addToWishlist(productId);
              set({ productIds: res.productIds });
            }
            return;
          } catch {
            // fallback to local toggle
          }
        }

        set({
          productIds: exists
            ? get().productIds.filter((id) => id !== productId)
            : [...get().productIds, productId],
        });
      },

      has: (productId) => get().productIds.includes(productId),

      remove: async (productId) => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            const res = await wishlistApi.removeFromWishlist(productId);
            set({ productIds: res.productIds });
            return;
          } catch {
            // fallback
          }
        }
        set({ productIds: get().productIds.filter((id) => id !== productId) });
      },
    }),
    { name: 'lume-wishlist' }
  )
);
