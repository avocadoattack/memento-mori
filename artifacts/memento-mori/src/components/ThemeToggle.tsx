import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card shadow-md border border-border text-foreground hover:scale-105 transition-transform"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 dark:hidden" />
      <Moon className="w-5 h-5 hidden dark:block" />
    </button>
  );
}
