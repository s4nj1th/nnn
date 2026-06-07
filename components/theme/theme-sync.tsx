'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import type { Theme } from '@/types';

export function ThemeSync() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!user || !theme) return;

    const supabase = createClient();
    const validTheme = ['light', 'dark', 'system'].includes(theme) ? (theme as Theme) : 'system';

    void supabase
      .from('users')
      .update({ theme: validTheme })
      .eq('id', user.id);
  }, [theme, user]);

  return null;
}
