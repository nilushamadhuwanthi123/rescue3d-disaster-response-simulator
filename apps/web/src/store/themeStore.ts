import { create } from 'zustand';

export type ThemePreference = 'dark' | 'light' | 'system';

const THEME_KEY = 'r3d.theme';
const MOTION_KEY = 'r3d.reducedMotion';

function readStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'dark' || raw === 'light' || raw === 'system' ? raw : 'system';
  } catch {
    return 'system';
  }
}

function readStoredReducedMotion(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) === 'true';
  } catch {
    return false;
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

interface ThemeState {
  preference: ThemePreference;
  reducedMotion: boolean;
  resolvedTheme: 'dark' | 'light';
  setPreference: (preference: ThemePreference) => void;
  setReducedMotion: (value: boolean) => void;
}

function resolve(preference: ThemePreference): 'dark' | 'light' {
  if (preference === 'system') {
    return systemPrefersDark() ? 'dark' : 'light';
  }
  return preference;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: readStoredTheme(),
  reducedMotion: readStoredReducedMotion(),
  resolvedTheme: resolve(readStoredTheme()),
  setPreference: (preference) => {
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
    set({ preference, resolvedTheme: resolve(preference) });
  },
  setReducedMotion: (value) => {
    try {
      localStorage.setItem(MOTION_KEY, String(value));
    } catch {
      // ignore
    }
    set({ reducedMotion: value });
  },
}));
