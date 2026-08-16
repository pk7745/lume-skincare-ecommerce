import { apiClient, setAccessToken } from './client';
import type { Profile } from '@/types';

export type UserDTO = {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses?: any[];
};

export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const data = await apiClient<{ success: boolean; accessToken: string; user: UserDTO }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiClient<{ success: boolean; accessToken: string; user: UserDTO }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  refresh: async () => {
    const data = await apiClient<{ success: boolean; accessToken: string; user: UserDTO }>(
      '/auth/refresh',
      {
        method: 'POST',
        skipRefresh: true,
      }
    );
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },

  getMe: async () => {
    const data = await apiClient<{ success: boolean; user: UserDTO }>('/auth/me');
    return data.user;
  },
};
