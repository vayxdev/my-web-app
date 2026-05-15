/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:       'rgb(var(--bg) / <alpha-value>)',
        surface:  'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        border:   'rgb(var(--border) / <alpha-value>)',
        text:     'rgb(var(--text) / <alpha-value>)',
        muted:    'rgb(var(--muted) / <alpha-value>)',
        subtle:   'rgb(var(--subtle) / <alpha-value>)',
        accent:   'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        danger:   'rgb(var(--danger) / <alpha-value>)',
        success:  'rgb(var(--success) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Tight"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 240ms ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
