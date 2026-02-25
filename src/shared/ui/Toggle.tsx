import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function Toggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    // Проверяем localStorage или системные настройки при инициализации
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Применяем тему к документу
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-50 focus:dark:ring-dark-800',
        'bg-primary-600', 'dark:bg-dark-500',
        className
      )}
      role="switch"
      aria-checked={isDark}
      aria-label="Переключить тему"
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isDark ? 'translate-x-6' : 'translate-x-1'
        )}
      >
      </span>
    </button>
  );
}