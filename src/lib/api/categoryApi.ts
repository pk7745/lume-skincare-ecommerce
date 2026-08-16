import { apiClient } from './client';
import type { Category } from '@/types';

export const categoryApi = {
  getCategories: async () => {
    const data = await apiClient<{ success: boolean; categories: Category[] }>('/categories');
    return data.categories || [];
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const data = await apiClient<{ success: boolean; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return data.category;
  },
};
