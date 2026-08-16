import { apiClient } from './client';
import type { Review } from '@/types';

export const reviewApi = {
  getProductReviews: async (productId: string) => {
    const data = await apiClient<{ success: boolean; reviews: Review[] }>(
      `/products/${productId}/reviews`
    );
    return data.reviews || [];
  },

  createReview: async (productId: string, review: { rating: number; title?: string; body: string }) => {
    const data = await apiClient<{ success: boolean; review: Review }>(
      `/products/${productId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(review),
      }
    );
    return data.review;
  },

  updateReview: async (id: string, review: Partial<Review>) => {
    const data = await apiClient<{ success: boolean; review: Review }>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(review),
    });
    return data.review;
  },

  deleteReview: async (id: string) => {
    return apiClient<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};
