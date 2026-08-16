import { apiClient } from './client';
import type { CartItem } from '@/types';

export type ServerCartResponse = {
  success: boolean;
  cart: {
    id: string;
    items: CartItem[];
    subtotal: number;
  };
};

export const cartApi = {
  getCart: async () => {
    const data = await apiClient<ServerCartResponse>('/cart');
    return data.cart;
  },

  addItem: async (productId: string, size: string, quantity: number = 1) => {
    const data = await apiClient<ServerCartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, size, quantity }),
    });
    return data.cart;
  },

  updateQty: async (productId: string, quantity: number, size?: string) => {
    const data = await apiClient<ServerCartResponse>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, size }),
    });
    return data.cart;
  },

  removeItem: async (productId: string, size?: string) => {
    const url = `/cart/items/${productId}${size ? `?size=${encodeURIComponent(size)}` : ''}`;
    const data = await apiClient<ServerCartResponse>(url, {
      method: 'DELETE',
    });
    return data.cart;
  },

  clearCart: async () => {
    const data = await apiClient<ServerCartResponse>('/cart', {
      method: 'DELETE',
    });
    return data.cart;
  },
};
