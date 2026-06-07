import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile, UserSettings } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  accentColor: 'yellow',
  gridVisible: true,
  gridDensity: 'normal',
  animationsEnabled: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      settings: defaultSettings,
      isLoading: true,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setSettings: (settings) => set({ settings }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      reset: () =>
        set({
          user: null,
          session: null,
          profile: null,
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
