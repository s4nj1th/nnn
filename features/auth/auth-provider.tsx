'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from 'next-themes';
import type { UserProfile } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setSettings, setLoading, setInitialized, reset } =
    useAuthStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setSession(session);
        await loadUserProfile(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
    })();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setSession(session);
          await loadUserProfile(session.user.id);
        } else {
          reset();
        }
      }
    );

    async function loadUserProfile(userId: string) {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setProfile(profile as UserProfile);
        setSettings({
          theme: profile.theme ?? 'system',
          accentColor: profile.accent_color ?? 'yellow',
          gridVisible: profile.grid_visible ?? true,
          gridDensity: profile.grid_density ?? 'normal',
          animationsEnabled: profile.animations_enabled ?? true,
        });
        if (profile.theme) {
          setTheme(profile.theme);
        }
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setSettings, setLoading, setInitialized, reset, setTheme]);

  return <>{children}</>;
}
