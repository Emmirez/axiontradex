/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      animation: {
        ticker:   'ticker 45s linear infinite',
        float:    'float 6s ease-in-out infinite',
        fadeUp:   'fadeUp 0.7s ease forwards',
        shimmer:  'shimmer 2.5s infinite',
        pulseGold:'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        ticker:    { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(32px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(245,158,11,0)' } },
      },
    },
  },
  plugins: [],
}
