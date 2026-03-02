import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const OLD_THEME_KEY = 'browser-bridge-theme';
const THEME_KEY = 'broxy-theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  // 迁移旧数据
  const oldTheme = localStorage.getItem(OLD_THEME_KEY);
  if (oldTheme && !localStorage.getItem(THEME_KEY)) {
    localStorage.setItem(THEME_KEY, oldTheme);
    localStorage.removeItem(OLD_THEME_KEY);
  }
  
  return localStorage.getItem(THEME_KEY) as Theme | null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = getStoredTheme();
    return stored || getSystemTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = getStoredTheme();
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  return { theme, toggleTheme };
}
