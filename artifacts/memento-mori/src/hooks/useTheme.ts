import { useState, useEffect } from 'react';
import { getSunriseSunset } from '../lib/sunCalc';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    let isDark = false;
    
    if (theme === 'auto') {
      const controller = new AbortController();
      let determined = false;

      const fallback = () => {
        if (determined) return;
        determined = true;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      };

      const timeout = setTimeout(fallback, 3000);

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (determined) return;
            determined = true;
            clearTimeout(timeout);
            const { latitude, longitude } = position.coords;
            const now = new Date();
            const times = getSunriseSunset(now, latitude, longitude);
            isDark = now < times.sunrise || now > times.sunset;
            document.documentElement.classList.toggle('dark', isDark);
          },
          fallback,
          { timeout: 3000 }
        );
      } else {
        fallback();
      }

      return () => {
        clearTimeout(timeout);
        controller.abort();
      };
    } else {
      isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      return;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'auto') {
        return document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  return { theme, toggleTheme };
}
