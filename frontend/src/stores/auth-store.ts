import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/http/types/user/get-profile';

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
    }),
    {
      name: 'copa-manager-auth',
    },
  ),
);
