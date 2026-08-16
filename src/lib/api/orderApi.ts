import { apiClient } from './client';
import type { Order, ShippingAddress } from '@/types';

export type CreateOrderPayload = {
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    size: string;
  }>;
  shipping_address: ShippingAddress;
  promoCode?: string;
};

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const data = await apiClient<{ success: boolean; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.order;
  },

  getOrders: async () => {
    const data = await apiClient<{ success: boolean; orders: Order[] }>('/orders');
    return data.orders || [];
  },

  getOrderById: async (id: string) => {
    const data = await apiClient<{ success: boolean; order: Order }>(`/orders/${id}`);
    return data.order;
  },

  validatePromo: async (code: string) => {
    const data = await apiClient<{
      success: boolean;
      promo: { code: string; discountType: string; discountValue: number };
    }>('/orders/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return data.promo;
  },
};
