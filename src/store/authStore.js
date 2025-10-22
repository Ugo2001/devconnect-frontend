// ============================================================================
// src/store/authStore.js - Zustand Auth Store (Alternative to Context)
// ============================================================================

import { create } from 'zustand';
import { apiClient } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (username, password) => {
    try {
      await apiClient.login(username, password);
      const user = await apiClient.getCurrentUser();
      set({ user, isAuthenticated: true });
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    apiClient.logout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      if (apiClient.accessToken) {
        const user = await apiClient.getCurrentUser();
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      apiClient.clearTokens();
    } finally {
      set({ loading: false });
    }
  },
}));
