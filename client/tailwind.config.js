/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        saffron: '#FF9933',
        india: {
          saffron: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-soft': 'bounceSoft 1s infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'typing': 'typing 1s steps(3) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        bounceSoft: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        wave: { '0%, 100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(1.8)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        typing: { '0%': { content: '.' }, '33%': { content: '..' }, '66%': { content: '...' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-saffron': '0 0 20px rgba(255, 153, 51, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
