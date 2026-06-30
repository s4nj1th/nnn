'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth-store';
import type { Theme } from '@/types';

export function ThemeSync() {
  const { theme } = useTheme();
  const { user, settings, setSettings } = useAuthStore();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!user || !theme) return;

    const validTheme = ['light', 'dark', 'system'].includes(theme) ? (theme as Theme) : 'system';

    if (settings && settings.theme !== validTheme) {
      setSettings({ ...settings, theme: validTheme });
    }
  }, [theme, user, settings, setSettings]);

  return null;
}
