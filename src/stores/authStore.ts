import { create } from 'zustand';
import { authApi, type UserDTO } from '@/lib/api/authApi';
import { userApi } from '@/lib/api/userApi';
import type { Profile } from '@/types';

type AuthState = {
  user: UserDTO | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  error: null,

  initAuth: async () => {
    try {
      set({ loading: true });
      // Attempt to refresh or get current logged in user
      const res = await authApi.refresh();
      if (res && res.user) {
        set({ user: res.user, initialized: true });
        await get().fetchProfile();
      } else {
        set({ user: null, profile: null, initialized: true });
      }
    } catch {
      set({ user: null, profile: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const addresses = await userApi.getAddresses();
      set({
        profile: {
          id: user.id,
          full_name: user.full_name || user.name || '',
          phone: user.phone || '',
          created_at: new Date().toISOString(),
        },
      });
    } catch {
      set({
        profile: {
          id: user.id,
          full_name: user.full_name || user.name || '',
          phone: user.phone || '',
          created_at: new Date().toISOString(),
        },
      });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      if (res.user) {
        set({ user: res.user, loading: false });
        await get().fetchProfile();
        return { error: null };
      }
      set({ loading: false, error: 'Login failed' });
      return { error: 'Login failed' };
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Invalid email or password';
      set({ loading: false, error: msg });
      return { error: msg };
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register(email, password, fullName);
      if (res.user) {
        set({ user: res.user, loading: false });
        await get().fetchProfile();
        return { error: null };
      }
      set({ loading: false, error: 'Registration failed' });
      return { error: 'Registration failed' };
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Registration failed';
      set({ loading: false, error: msg });
      return { error: msg };
    }
  },

  signOut: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on signout
    } finally {
      set({ user: null, profile: null });
    }
  },

  clearError: () => set({ error: null }),
}));
