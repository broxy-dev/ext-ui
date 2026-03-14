import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useCurrentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

interface UseThemeOptions {
  externalTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export function useTheme(options?: UseThemeOptions) {
  const { externalTheme, onThemeChange } = options || {};

  const [theme, setTheme] = useState<Theme>(() => {
    if (externalTheme && externalTheme !== 'system') {
      return externalTheme as Theme;
    }
    return getSystemTheme();
  });

  useEffect(() => {
    if (externalTheme && externalTheme !== 'system' && externalTheme !== theme) {
      setTheme(externalTheme as Theme);
    }
  }, [externalTheme, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (!externalTheme || externalTheme === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [externalTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return { theme, toggleTheme };
}
