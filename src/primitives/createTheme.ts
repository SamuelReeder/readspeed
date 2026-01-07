import { createSignal, createEffect } from 'solid-js';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'readspeed_theme';

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'dark'; // default
}

export function createTheme() {
  const [theme, setTheme] = createSignal<Theme>(getInitialTheme());

  // Apply theme to document
  createEffect(() => {
    const currentTheme = theme();
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem(STORAGE_KEY, currentTheme);
    } catch {
      // localStorage not available
    }
  });

  const toggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = () => theme() === 'dark';

  return {
    theme,
    setTheme,
    toggle,
    isDark,
  };
}
