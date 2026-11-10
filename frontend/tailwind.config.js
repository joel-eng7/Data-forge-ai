/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gestura: {
          // Strict user palette
          yellow: '#FFD633',       // Primary Bright Premium Yellow
          yellowHover: '#F5C21B',  // Deepened Yellow on hover
          gold: '#FFE680',         // Soft Golden Yellow Accent
          goldLight: '#FFFBE6',    // Warm light yellow tint
          goldUltraLight: '#FFFDF5',
          bg: '#FAF9F4',           // Warm Off-White Background
          card: '#FFFFFF',         // Pure White
          text: '#171717',         // Deep Charcoal / Black Text
          textMuted: '#666660',    // Muted Charcoal
          textSubtle: '#8C8C85',   // Subtle Grey
          border: '#EFECE6',       // Warm Off-White Border
          borderDark: '#DDD9CF',   // Darker border
          surface: '#F5F4EE',      // Soft warm surface
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'yellow-subtle': '0 4px 20px -2px rgba(255, 214, 51, 0.18)',
        'yellow-glow': '0 0 25px rgba(255, 214, 51, 0.35)',
        'yellow-glow-lg': '0 0 45px rgba(255, 214, 51, 0.45)',
        'card-soft': '0 8px 30px rgba(23, 23, 23, 0.04)',
        'card-elevated': '0 18px 45px -10px rgba(23, 23, 23, 0.07)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 214, 51, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 214, 51, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
