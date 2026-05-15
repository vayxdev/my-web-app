import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换到亮色' : '切换到暗色'}
      title={isDark ? '亮色' : '暗色'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated text-muted hover:text-text hover:border-subtle transition-colors ${className}`}
    >
      <span className="relative h-4 w-4">
        <Sun
          size={16}
          strokeWidth={1.8}
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          size={16}
          strokeWidth={1.8}
          className={`absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
