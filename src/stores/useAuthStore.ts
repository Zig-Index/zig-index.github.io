import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  login: string;
  avatar_url: string;
  name: string | null;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  showSignInDialog: boolean;
  setToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  setShowSignInDialog: (show: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      showSignInDialog: false,
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      setShowSignInDialog: (show) => set({ showSignInDialog: show }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'zig-index-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // Don't persist dialog state
    }
  )
);
