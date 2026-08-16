import { apiClient } from './client';
import type { ShippingAddress } from '@/types';

export const userApi = {
  updateProfile: async (data: { full_name?: string; name?: string; phone?: string }) => {
    const res = await apiClient<{ success: boolean; user: any }>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  getAddresses: async () => {
    const res = await apiClient<{ success: boolean; addresses: ShippingAddress[] }>(
      '/users/addresses'
    );
    return res.addresses || [];
  },

  addAddress: async (address: ShippingAddress) => {
    const res = await apiClient<{ success: boolean; addresses: ShippingAddress[] }>(
      '/users/addresses',
      {
        method: 'POST',
        body: JSON.stringify(address),
      }
    );
    return res.addresses;
  },

  updateAddress: async (id: string, address: Partial<ShippingAddress>) => {
    const res = await apiClient<{ success: boolean; addresses: ShippingAddress[] }>(
      `/users/addresses/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(address),
      }
    );
    return res.addresses;
  },

  deleteAddress: async (id: string) => {
    const res = await apiClient<{ success: boolean; addresses: ShippingAddress[] }>(
      `/users/addresses/${id}`,
      {
        method: 'DELETE',
      }
    );
    return res.addresses;
  },
};
