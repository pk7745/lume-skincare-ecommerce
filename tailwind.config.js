/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // 60% — warm neutral base
        sand: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ebe5da',
          300: '#ddd4c5',
          400: '#c5b9a4',
          500: '#a89a82',
          600: '#8a7d68',
          700: '#6b6152',
          800: '#4a4339',
          900: '#2d2822',
        },
        // 30% — deep warm charcoal
        ink: {
          50: '#f7f6f4',
          100: '#eeedea',
          200: '#d8d5cf',
          300: '#b8b3a9',
          400: '#8e887d',
          500: '#6b6559',
          600: '#524e44',
          700: '#3d3a33',
          800: '#2a2823',
          900: '#1a1815',
        },
        // 10% — accent: muted terracotta
        clay: {
          50: '#fbf3f0',
          100: '#f5e2db',
          200: '#e8c4b6',
          300: '#d49e88',
          400: '#c47a5e',
          500: '#b56244',
          600: '#9c4f36',
          700: '#7d3d2b',
          800: '#5e2f22',
          900: '#422016',
        },
        sage: {
          50: '#f3f6f2',
          100: '#e3ebe1',
          200: '#c7d6c4',
          300: '#a3bb9f',
          400: '#7d9a78',
          500: '#5e7c5a',
          600: '#4a6347',
          700: '#3a4f38',
          800: '#2d3e2c',
          900: '#1f2c1f',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      borderRadius: {
        token: '0.5rem',
        'token-lg': '1rem',
        'token-xl': '1.5rem',
        'token-2xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(42, 40, 37, 0.06)',
        'soft-lg': '0 8px 32px rgba(42, 40, 37, 0.08)',
        'soft-xl': '0 16px 48px rgba(42, 40, 37, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
