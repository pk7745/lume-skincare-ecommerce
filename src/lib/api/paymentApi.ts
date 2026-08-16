import { apiClient } from './client';

export const paymentApi = {
  createCheckoutSession: async (orderId: string) => {
    const data = await apiClient<{
      success: boolean;
      mode: 'mock' | 'stripe';
      url: string;
      sessionId?: string;
      order?: any;
    }>('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return data;
  },
};
