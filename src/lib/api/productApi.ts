import { apiClient } from './client';
import type { Product } from '@/types';

export type ProductQueryFilter = {
  search?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  skinType?: string;
  sort?: string;
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
};

export type ProductListResponse = {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
};

export const productApi = {
  getProducts: async (filters: ProductQueryFilter = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice !== undefined && filters.minPrice !== '') params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') params.set('maxPrice', String(filters.maxPrice));
    if (filters.skinType) params.set('skinType', filters.skinType);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.featured) params.set('featured', 'true');
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const data = await apiClient<ProductListResponse>(`/products?${params.toString()}`);
    return data.products;
  },

  getProductBySlug: async (slug: string) => {
    const data = await apiClient<{ success: boolean; product: Product }>(`/products/slug/${slug}`);
    return data.product;
  },

  getProductById: async (id: string) => {
    const data = await apiClient<{ success: boolean; product: Product }>(`/products/${id}`);
    return data.product;
  },

  getAutocomplete: async (q: string, limit = 6) => {
    const data = await apiClient<{ success: boolean; suggestions: Product[] }>(
      `/products/search/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`
    );
    return data.suggestions;
  },

  getTrending: async (limit = 8) => {
    const data = await apiClient<{ success: boolean; products: Product[] }>(`/products/trending?limit=${limit}`);
    return data.products;
  },

  getBestSellers: async (limit = 8) => {
    const data = await apiClient<{ success: boolean; products: Product[] }>(`/products/best-sellers?limit=${limit}`);
    return data.products;
  },

  getNewArrivals: async (limit = 8) => {
    const data = await apiClient<{ success: boolean; products: Product[] }>(`/products/new-arrivals?limit=${limit}`);
    return data.products;
  },

  getRecommendations: async (id: string, limit = 4) => {
    const data = await apiClient<{ success: boolean; products: Product[] }>(
      `/products/${id}/recommendations?limit=${limit}`
    );
    return data.products;
  },

  logEvent: async (id: string, eventType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase', quantity = 1) => {
    try {
      await apiClient(`/products/${id}/event`, {
        method: 'POST',
        body: JSON.stringify({ eventType, quantity }),
      });
    } catch (err) {
      // Ignore logging failures gracefully
    }
  },

  createProduct: async (productData: Partial<Product>) => {
    const data = await apiClient<{ success: boolean; product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const data = await apiClient<{ success: boolean; product: Product }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.product;
  },

  deleteProduct: async (id: string) => {
    await apiClient(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
