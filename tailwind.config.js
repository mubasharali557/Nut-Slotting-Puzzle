/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        game: {
          bg: '#0a0d1a',
          surface: '#12172b',
          card: '#18203c',
          border: '#2a3560',
          accent: '#6366f1',
          cyan: '#06b6d4',
          fuchsia: '#d946ef',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          violet: '#8b5cf6',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        bubble: {
          '0%': { transform: 'translateY(100%) scale(0.6)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20%) scale(1.1)', opacity: '0' },
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        bubble: 'bubble 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

