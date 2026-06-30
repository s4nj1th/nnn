import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserSettings } from '@/types';

interface LocalUser {
  id: string;
  email: string;
}

interface AuthState {
  user: LocalUser | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSettings: (settings: UserSettings | null) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  accentColor: 'yellow',
  gridVisible: true,
  gridDensity: 'normal',
  animationsEnabled: true,
};

const localUserId = 'local-user';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { id: localUserId, email: 'local@localhost' },
      profile: { id: localUserId, email: 'local@localhost', username: 'Local User', avatarUrl: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      settings: defaultSettings,
      isLoading: false,
      isInitialized: true,
      setSettings: (settings) => set({ settings }),
      reset: () =>
        set({
          user: { id: localUserId, email: 'local@localhost' },
          profile: { id: localUserId, email: 'local@localhost', username: 'Local User', avatarUrl: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          settings: defaultSettings,
          isLoading: false,
          isInitialized: true,
        }),
    }),
    {
      name: 'nnn-auth',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
