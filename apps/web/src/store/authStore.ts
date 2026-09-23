import { create } from 'zustand';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@rescue3d/contracts';
import { apiRequest, setAccessToken } from '../lib/apiClient';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  login: async (input) => {
    set({ status: 'loading', error: null });
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setAccessToken(data.tokens.accessToken);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      set({ status: 'unauthenticated', error: (err as Error).message });
      throw err;
    }
  },

  register: async (input) => {
    set({ status: 'loading', error: null });
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setAccessToken(data.tokens.accessToken);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      set({ status: 'unauthenticated', error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },

  // Called once on app load: an access token lives in memory only, so a
  // page refresh needs to trade the httpOnly refresh cookie for a new one
  // before we know whether the visitor is actually signed in.
  restoreSession: async () => {
    set({ status: 'loading' });
    try {
      const data = await apiRequest<AuthResponse>('/auth/refresh', { method: 'POST' });
      setAccessToken(data.tokens.accessToken);
      set({ user: data.user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
