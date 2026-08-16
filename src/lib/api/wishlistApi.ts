import { apiClient } from './client';
import type { Product } from '@/types';

export const wishlistApi = {
  getWishlist: async () => {
    const data = await apiClient<{
      success: boolean;
      productIds: string[];
      products: Product[];
    }>('/wishlist');
    return data;
  },

  addToWishlist: async (productId: string) => {
    const data = await apiClient<{
      success: boolean;
      productIds: string[];
      products: Product[];
    }>(`/wishlist/${productId}`, {
      method: 'POST',
    });
    return data;
  },

  removeFromWishlist: async (productId: string) => {
    const data = await apiClient<{
      success: boolean;
      productIds: string[];
      products: Product[];
    }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
    return data;
  },
};
