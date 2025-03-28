import create from 'zustand';
import { apiService } from '../services/api';
import { LoginResponse, RegisterResponse } from '../services/authApi';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  error: null,
  loading: false,

  login: async (email: string, password: string) => {
    // In a real app, this would make an API call
    // For demo purposes, we'll just set a mock user
    set({
      user: {
        id: 1,
        name: 'Demo User',
        email: email,
        role: 'admin',
      },
    });
  },

  register: async (name: string, email: string, password: string) => {
    // In a real app, this would make an API call
    // For demo purposes, we'll just set a mock user
    set({
      user: {
        id: 1,
        name: name,
        email: email,
        role: 'user',
      },
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  clearError: () => {
    set({ error: null });
  },
})); 