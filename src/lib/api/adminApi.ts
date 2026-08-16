import { apiClient } from './client';
import type { Order, Review, Product } from '@/types';

export type TopProductItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  unitsSold: number;
  revenue: number;
};

export type AdminDashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  aov: number;
  conversionRate: number;
  lowStockCount: number;
  trends: {
    revenueTrendPct: number;
    ordersTrendPct: number;
    aovTrendPct: number;
  };
  recentOrders: Array<{
    id: string;
    email: string;
    total: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  topProducts: TopProductItem[];
};

export type SalesAnalyticsItem = {
  date: string;
  revenue: number;
  orders: number;
};

export type ProductAnalyticsDetail = {
  views: number;
  cartAdds: number;
  wishlistAdds: number;
  unitsSold: number;
  revenue: number;
  conversionRate: number;
  currentStock: number;
  rating: number;
  reviewCount: number;
  demandLevel: string;
  historicalSales: Array<{ date: string; units: number; revenue: number }>;
};

export type InventoryAnalytics = {
  summary: {
    totalProducts: number;
    totalValuation: number;
    healthyCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  items: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    stock: number;
    status: 'healthy' | 'low_stock' | 'out_of_stock';
  }>;
};

export type CategoryAnalyticsItem = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  unitsSold: number;
  revenue: number;
  revenuePct: number;
};

export type CustomerAnalyticsMetrics = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrdersPerCustomer: number;
  avgCustomerLifetimeValue: number;
};

export type ActivityItem = {
  type: 'order' | 'review' | 'customer';
  title: string;
  meta: string;
  timestamp: string;
};

export const adminApi = {
  getDashboardStats: async () => {
    const data = await apiClient<{ success: boolean; stats: AdminDashboardStats }>('/admin/dashboard');
    return data.stats;
  },

  getSalesAnalytics: async (range: '7d' | '30d' | '90d' | '12m' = '30d') => {
    const data = await apiClient<{ success: boolean; data: SalesAnalyticsItem[] }>(
      `/admin/analytics/sales?range=${range}`
    );
    return data.data;
  },

  getSingleProductAnalytics: async (id: string) => {
    const data = await apiClient<{ success: boolean; product: Product; analytics: ProductAnalyticsDetail }>(
      `/admin/analytics/products/${id}`
    );
    return data;
  },

  getInventoryAnalytics: async () => {
    const data = await apiClient<{ success: boolean } & InventoryAnalytics>('/admin/analytics/inventory');
    return data;
  },

  getCategoryAnalytics: async () => {
    const data = await apiClient<{ success: boolean; categories: CategoryAnalyticsItem[] }>(
      '/admin/analytics/categories'
    );
    return data.categories;
  },

  getCustomerAnalytics: async () => {
    const data = await apiClient<{ success: boolean; metrics: CustomerAnalyticsMetrics }>(
      '/admin/analytics/customers'
    );
    return data.metrics;
  },

  getRecentActivity: async () => {
    const data = await apiClient<{ success: boolean; activities: ActivityItem[] }>('/admin/activity');
    return data.activities;
  },

  reseedDemoData: async () => {
    const data = await apiClient<{ success: boolean; message: string; counts: any }>('/admin/demo/reseed', {
      method: 'POST',
    });
    return data;
  },

  getAllOrders: async () => {
    const data = await apiClient<{ success: boolean; orders: Order[] }>('/admin/orders');
    return data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const data = await apiClient<{ success: boolean; order: Order }>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.order;
  },

  getAllReviews: async () => {
    const data = await apiClient<{ success: boolean; reviews: Review[] }>('/admin/reviews');
    return data.reviews;
  },

  deleteReview: async (reviewId: string) => {
    await apiClient(`/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};
