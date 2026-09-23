import { useEffect, type PropsWithChildren } from 'react';
import { useThemeStore } from '../store/themeStore';

/**
 * Applies the resolved theme + reduced-motion setting to <html> as data
 * attributes, and keeps `resolvedTheme` in sync when the preference is
 * "system" and the OS setting changes mid-session.
 */
export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const preference = useThemeStore((s) => s.preference);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const setPreference = useThemeStore((s) => s.setPreference);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    if (preference !== 'system') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setPreference('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preference, setPreference]);

  return <>{children}</>;
}
