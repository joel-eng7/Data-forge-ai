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
          // Strict Premium Yellow & Pure White Palette
          yellow: '#FFD633',          // Primary: Bright premium yellow
          yellowHover: '#F5C21B',     // Soft golden yellow
          yellowDeep: '#EAB308',      // Deep golden yellow
          goldLight: '#FFF9DB',       // Softest warm golden tint
          goldMuted: '#FEF08A',       // Golden muted badge
          card: '#FFFFFF',            // Secondary: Pure white
          surface: '#FAF9F4',         // Background: Warm off-white
          surfaceAlt: '#F4F2EA',      // Warm off-white card/slot
          surfaceElevated: '#FFFFFF', // Elevated card
          text: '#171717',            // Text: Deep charcoal/black
          textMuted: '#525252',       // Neutral dark grey
          textSubtle: '#737373',      // Subtle charcoal
          border: '#EAE6D9',          // Warm light border
          borderDark: '#D5CFBE',      // Defined warm border
          borderYellow: '#FFD633',    // Glowing yellow border
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'yellow-subtle': '0 4px 20px -2px rgba(255, 214, 51, 0.30)',
        'yellow-glow': '0 0 25px rgba(255, 214, 51, 0.50)',
        'yellow-glow-lg': '0 0 45px rgba(255, 214, 51, 0.70)',
        'card-soft': '0 4px 24px -2px rgba(23, 23, 23, 0.05)',
        'card-elevated': '0 18px 45px -10px rgba(23, 23, 23, 0.08)',
        'card-glass': '0 12px 35px -8px rgba(23, 23, 23, 0.06)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 214, 51, 0.25)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 214, 51, 0.65)' },
        }
      }
    },
  },
  plugins: [],
}
