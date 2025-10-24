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

  // Register new user
  register: async (userData) => {
    try {
      // Use apiClient instead of axios
      const response = await apiClient.post('/api/users/', userData);
      
      if (response.data.tokens) {
        // Store tokens
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        
        // Update apiClient token
        apiClient.accessToken = response.data.tokens.access;
        
        // Update store
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          loading: false
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      await apiClient.login(username, password);
      const user = await apiClient.getCurrentUser();
      set({ user, isAuthenticated: true, loading: false });
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